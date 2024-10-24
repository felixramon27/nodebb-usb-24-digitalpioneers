/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import _ from 'lodash';
import db from '../database';
import user from '../user';
import privileges from '../privileges';
import plugins from '../plugins';

interface Topic {
  tid: string;
  timestamp: number;
}

interface TopicFields {
  cid: string;
  title: string;
  tags: { value: string }[];
}

interface TopicsType {
  getTopicFields: (tid: string, fields: string[]) => Promise<TopicFields>;
  getTopicsByTids: (tids: string[], uid: string) => Promise<Topic[]>;
  calculateTopicIndices: (topics: Topic[], start: number) => void;
  getSuggestedTopics?: (
    tid: string,
    uid: string,
    start: number,
    stop: number,
    cutoff?: number
  ) => Promise<Topic[]>;
}

function Suggested(Topics: TopicsType) {
	async function getTidsWithSameTags(tid: string, tags: string[], cutoff: number): Promise<string[]> {
		const tids = cutoff === 0 ?
			await db?.getSortedSetRevRange(tags.map(tag => `tag:${tag}:topics`), 0, -1) as Promise<string[]> :
			await db?.getSortedSetRevRangeByScore(tags.map(tag => `tag:${tag}:topics`), 0, -1, '+inf', Date.now() - cutoff) as Promise<string[]>;

		return _.shuffle(_.uniq((await tids).filter((_tid: string) => _tid !== tid))).slice(0, 10);
	}

	async function getSearchTids(
		tid: string, title: string, cid: string, cutoff: number, uid: string
	): Promise<string[]> {
		const { ids: tids } = await plugins.hooks.fire('filter:search.query', {
			index: 'topic',
			content: title,
			matchWords: 'any',
			cid: [cid],
			limit: 20,
			ids: [],
		}) as { ids: string[] };

		const filteredTids = tids.filter(_tid => _tid !== tid);

		if (cutoff) {
			const topicData = await Topics.getTopicsByTids(filteredTids, uid);
			const now = Date.now();
			return _.shuffle(
				topicData.filter(t => t && t.timestamp > now - cutoff).map(t => t.tid)
			).slice(0, 10);
		}

		return _.shuffle(filteredTids).slice(0, 10);
	}

	async function getCategoryTids(tid: string, cid: string, cutoff: number): Promise<string[]> {
		const tids = cutoff === 0 ?
			await db?.getSortedSetRevRange(`cid:${cid}:tids:lastposttime`, 0, 9) as Promise<string[]> :
			await db?.getSortedSetRevRangeByScore(`cid:${cid}:tids:lastposttime`, 0, 10, '+inf', Date.now() - cutoff) as Promise<string[]>;

		return _.shuffle((await tids).filter((_tid: string) => _tid !== tid));
	}

	Topics.getSuggestedTopics = async function (
		tid: string,
		uid: string,
		start: number,
		stop: number,
		cutoff = 0
	): Promise<Topic[]> {
		if (!tid) return [];

		tid = String(tid);
		cutoff = cutoff === 0 ? cutoff : cutoff * 2592000000;
		const { cid, title, tags } = await Topics.getTopicFields(tid, ['cid', 'title', 'tags']);

		const [tagTids, searchTids] = await Promise.all([
			getTidsWithSameTags(tid, tags.map(t => t.value), cutoff),
			getSearchTids(tid, title, cid, cutoff, uid),
		]);

		let tids = _.uniq([...tagTids, ...searchTids]);

		let categoryTids: string[] = [];
		if (stop !== -1 && (tids).length < stop - start + 1) {
			categoryTids = await getCategoryTids(tid, cid, cutoff);
		}
		tids = _.shuffle(_.uniq([...tids, ...categoryTids]));
		tids = await privileges.topics.filterTids('topics:read', tids, uid) as string[];

		let topicData = await Topics.getTopicsByTids(tids, uid);
		topicData = topicData.filter(topic => topic && topic.tid !== tid);
		topicData = await user.blocks.filter(uid, topicData) as Topic[];
		topicData = topicData.slice(start, stop !== -1 ? stop + 1 : undefined)
			.sort((t1, t2) => t2.timestamp - t1.timestamp);
		Topics.calculateTopicIndices(topicData, start);
		return topicData;
	};
}

export = Suggested
