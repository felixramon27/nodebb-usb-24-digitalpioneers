'use strict';

const db = require('../database');

// beforeEach(async () => {
//     const topicId1 = 1; // Reemplaza con el ID del primer tema de prueba
//     const topicId2 = 2; // Reemplaza con el ID del segundo tema de prueba
//     // Remover cualquier estado de programación o atributos adicionales en temas de prueba
//     await Promise.all([
//         db.deleteObjectField(`topic:${topicId1}`, 'scheduled'),
//         db.deleteObjectField(`topic:${topicId2}`, 'scheduled'),
//         db.deleteObjectField(`topic:${topicId1}`, 'status'),
//         db.deleteObjectField(`topic:${topicId2}`, 'status'),
//         db.deleteObjectField(`topic:${topicId1}`, 'locked'),
//         db.deleteObjectField(`topic:${topicId2}`, 'locked')
//     ]);
// });

module.exports = function (User) {
	User.getIgnoredTids = async function (uid, start, stop) {
		return await db.getSortedSetRevRange(`uid:${uid}:ignored_tids`, start, stop);
	};

	User.addTopicIdToUser = async function (uid, tid, timestamp) {
		await Promise.all([
			db.sortedSetAdd(`uid:${uid}:topics`, timestamp, tid),
			User.incrementUserFieldBy(uid, 'topiccount', 1),
		]);
	};
};
