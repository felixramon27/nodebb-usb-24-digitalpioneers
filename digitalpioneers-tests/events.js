'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const db = require('../test/mocks/databasemock');
const plugins = require('../src/plugins');
const categories = require('../src/categories');
const topics = require('../src/topics');
const user = require('../src/user');
const jsdomGlobal = require('jsdom-global');
const { JSDOM } = require('jsdom');

describe('Topic Events', () => {
	let fooUid;
	let topic;
	let data;
	let expect;

	before(async () => {
		
		const chai = await import('chai');
        expect = chai.expect;

		fooUid = await user.create({ username: 'foo', password: 'barbar', gdpr_consent: true });

		const categoryObj = await categories.create({
			name: 'Test Category',
			description: 'Test category created by testing script',
		});
		topic = await topics.post({
			title: 'topic events testing',
			content: 'foobar one two three',
			pid: 1,
			uid: fooUid,
			cid: 1,
			upvotes : 2,
			downvotes : 1
		});

		data = {
			post: {
                pid: 1,
                upvotes: 2,
                downvotes: 1,
                uid: fooUid
            },
			user : {reputation : 100}
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

			// Mock the define function
            global.define = function (name, deps, callback) {
                global[name] = callback(
                    {}, // postTools
                    { setDeleteState: () => {} }, // threadTools
                    {}, // posts
                    {}, // images
                    {}, // components
                    {}, // translator
                    {}, // hooks
                    {}  // helpers
                );
            };

			// Mock the function
			updatePostVotesAndUserReputation = require('../public/src/client/topic/events').updatePostVotesAndUserReputation;
			
			//assert.strictEqual(fooUid,1);
			// Agrega elementos al DOM
			
			$('body').append(`
				<div data-pid="1">
                    <a href="#" class="px-2 mx-1 btn-ghost-sm" component="post/upvote-count" data-upvotes="0" title="[[global:upvoters]]">0</a>
                    <a href="#" class="px-2 mx-1 btn-ghost-sm" component="post/downvote-count" data-downvotes="0" title="[[global:downvoters]]">0</a>
                </div>
                <div class="reputation" data-uid="${fooUid}" data-reputation="50">0</div>
			`);
			

	});

	it('should update upvotes count', function () {
		
        updatePostVotesAndUserReputation(data);

		assert.strictEqual($('[data-pid="1"] [component="post/upvote-count"]').html(), '2', 'Upvotes count should be updated');
        assert.strictEqual($('[data-pid="1"] [component="post/upvote-count"]').attr('data-upvotes'), '2', 'Upvotes attribute should be updated');
	});

	it('should update downvotes count', function () {
		
        updatePostVotesAndUserReputation(data);

		assert.strictEqual($('[data-pid="1"] [component="post/downvote-count"]').html(), '1', 'Downvotes count should be updated');
        assert.strictEqual($('[data-pid="1"] [component="post/downvote-count"]').attr('data-downvotes'), '1', 'Downvotes attribute should be updated');
	});

	it('should update reputation', function () {
		updatePostVotesAndUserReputation(data);

		assert.strictEqual($('.reputation[data-uid="' + fooUid + '"]').html(), '100', 'Reputation should be updated');
		assert.strictEqual($('.reputation[data-uid="' + fooUid + '"]').attr('data-reputation'), '100', 'Reputation attribute should be updated');
	});

	});
});