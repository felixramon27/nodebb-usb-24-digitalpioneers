'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const jsdomGlobal = require('jsdom-global');
const { JSDOM } = require('jsdom');
const db = require('../mocks/databasemock');
const plugins = require('../../src/plugins');
const categories = require('../../src/categories');
const topics = require('../../src/topics');
const user = require('../../src/user');

describe('Topic Events', () => {
	let fooUid;
	let topic;
	let data;
	let expect;

	before(async () => {
		fooUid = await user.create({ username: 'foo', password: 'barbar', gdpr_consent: true });

		const categoryObj = await categories.create({
			name: 'Test Category',
			cid: 1,
			description: 'Test category created by testing script',
		});

		topic = await topics.post({
			title: 'topic events testing',
			content: 'foobar one two three',
			pid: 1,
			uid: fooUid,
			cid: 1,
			upvotes: 2,
			downvotes: 1,
		});

		data = {
			post: {
				pid: 1,
				upvotes: 2,
				downvotes: 1,
				uid: fooUid,
			},
			user: { reputation: 100 },
		};

		assert(fooUid, 'fooUid should be defined');
		assert(topic, 'topic should be defined');
		assert(data, 'data should be defined');
	});

	describe('updatePostVotesAndUserReputation', () => {
		let updatePostVotesAndUserReputation;

		beforeEach(() => {
			// Set up the DOM elements using jsdom-global
			jsdomGlobal();
			global.$ = require('jquery');

			// Mock de la funcion define de ./../public/src/client/topic/events
			global.define = function (name, deps, callback) {
				global[name] = callback(
					{}, // postTools
					{ setDeleteState: () => {} }, // threadTools
					{}, // posts
					{}, // images
					{}, // components
					{}, // translator
					{}, // hooks
					{} // helpers
				);
			};

			// Mock the function
			updatePostVotesAndUserReputation = require('../../public/src/client/topic/events').updatePostVotesAndUserReputation;

			// Agrega elementos al DOM

			global.$('body').append(`
                <div data-pid="1">
                    <a href="#" class="px-2 mx-1 btn-ghost-sm" component="post/upvote-count" data-upvotes="0"
                        title="[[global:upvoters]]">0</a>
                    <a href="#" class="px-2 mx-1 btn-ghost-sm" component="post/downvote-count" data-downvotes="0"
                        title="[[global:downvoters]]">0</a>
                </div>
                <div class="reputation" data-uid="${fooUid}" data-reputation="50">0</div>
            `);
		});

		after(async () => {
			// Limpieza de la base de datos
			if (topic && topic.tid) {
				await topics.delete(topic.tid);
			}
			if (fooUid) {
				const userExists = await user.exists(fooUid);

				if (userExists) {
					await user.deleteAccount(fooUid);
				} else {
					console.error('User does not exist:', fooUid);
				}
			}
			const category = await categories.getCategoriesData(1);
			if (category && category.cid) {
				await categories.purgeCategory(category.cid, category);
			}
		});

		it('should update upvotes count', () => {
			updatePostVotesAndUserReputation(data);
			// El elemento en el DOM con el componente debe tener el mismo valor que en data
			assert.strictEqual(global.$('[data-pid="1"] [component="post/upvote-count"]').html(),
				'2',
				'Upvotes count should be updated');

			assert.strictEqual(global.$('[data-pid="1"] [component="post/upvote-count"]').attr('data-upvotes'),
				'2',
				'Upvotes attribute should be updated');
		});

		it('should update downvotes count', () => {
			updatePostVotesAndUserReputation(data);
			// El elemento en el DOM con el componente debe tener el mismo valor que en data
			assert.strictEqual(global.$('[data-pid="1"] [component="post/downvote-count"]').html(),
				'1',
				'Downvotes count should be updated');

			assert.strictEqual(global.$('[data-pid="1"] [component="post/downvote-count"]').attr('data-downvotes'),
				'1',
				'Downvotes attribute should be updated');
		});

		it('should update reputation', () => {
			updatePostVotesAndUserReputation(data);
			// El elemento en el DOM con el componente debe tener el mismo valor que en data
			assert.strictEqual(global.$(`.reputation[data-uid="${fooUid}"]`).html(),
				'100',
				'Reputation should be updated');

			assert.strictEqual(global.$(`.reputation[data-uid="${fooUid}"]`).attr('data-reputation'),
				'100',
				'Reputation attribute should be updated');
		});
	});
});
