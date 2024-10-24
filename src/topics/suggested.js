"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
const lodash_1 = __importDefault(require("lodash"));
const database_1 = __importDefault(require("../database"));
const user_1 = __importDefault(require("../user"));
const privileges_1 = __importDefault(require("../privileges"));
const plugins_1 = __importDefault(require("../plugins"));
function Suggested(Topics) {
    async function getTidsWithSameTags(tid, tags, cutoff) {
        const tids = cutoff === 0 ?
            await (database_1.default === null || database_1.default === void 0 ? void 0 : database_1.default.getSortedSetRevRange(tags.map(tag => `tag:${tag}:topics`), 0, -1)) :
            await (database_1.default === null || database_1.default === void 0 ? void 0 : database_1.default.getSortedSetRevRangeByScore(tags.map(tag => `tag:${tag}:topics`), 0, -1, '+inf', Date.now() - cutoff));
        return lodash_1.default.shuffle(lodash_1.default.uniq((await tids).filter((_tid) => _tid !== tid))).slice(0, 10);
    }
    async function getSearchTids(tid, title, cid, cutoff, uid) {
        const { ids: tids } = await plugins_1.default.hooks.fire('filter:search.query', {
            index: 'topic',
            content: title,
            matchWords: 'any',
            cid: [cid],
            limit: 20,
            ids: [],
        });
        const filteredTids = tids.filter(_tid => _tid !== tid);
        if (cutoff) {
            const topicData = await Topics.getTopicsByTids(filteredTids, uid);
            const now = Date.now();
            return lodash_1.default.shuffle(topicData.filter(t => t && t.timestamp > now - cutoff).map(t => t.tid)).slice(0, 10);
        }
        return lodash_1.default.shuffle(filteredTids).slice(0, 10);
    }
    async function getCategoryTids(tid, cid, cutoff) {
        const tids = cutoff === 0 ?
            await (database_1.default === null || database_1.default === void 0 ? void 0 : database_1.default.getSortedSetRevRange(`cid:${cid}:tids:lastposttime`, 0, 9)) :
            await (database_1.default === null || database_1.default === void 0 ? void 0 : database_1.default.getSortedSetRevRangeByScore(`cid:${cid}:tids:lastposttime`, 0, 10, '+inf', Date.now() - cutoff));
        return lodash_1.default.shuffle((await tids).filter((_tid) => _tid !== tid));
    }
    Topics.getSuggestedTopics = async function (tid, uid, start, stop, cutoff = 0) {
        if (!tid)
            return [];
        tid = String(tid);
        cutoff = cutoff === 0 ? cutoff : cutoff * 2592000000;
        const { cid, title, tags } = await Topics.getTopicFields(tid, ['cid', 'title', 'tags']);
        const [tagTids, searchTids] = await Promise.all([
            getTidsWithSameTags(tid, tags.map(t => t.value), cutoff),
            getSearchTids(tid, title, cid, cutoff, uid),
        ]);
        let tids = lodash_1.default.uniq([...tagTids, ...searchTids]);
        let categoryTids = [];
        if (stop !== -1 && (tids).length < stop - start + 1) {
            categoryTids = await getCategoryTids(tid, cid, cutoff);
        }
        tids = lodash_1.default.shuffle(lodash_1.default.uniq([...tids, ...categoryTids]));
        tids = await privileges_1.default.topics.filterTids('topics:read', tids, uid);
        let topicData = await Topics.getTopicsByTids(tids, uid);
        topicData = topicData.filter(topic => topic && topic.tid !== tid);
        topicData = await user_1.default.blocks.filter(uid, topicData);
        topicData = topicData.slice(start, stop !== -1 ? stop + 1 : undefined)
            .sort((t1, t2) => t2.timestamp - t1.timestamp);
        Topics.calculateTopicIndices(topicData, start);
        return topicData;
    };
}
module.exports = Suggested;
