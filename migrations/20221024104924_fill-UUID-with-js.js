const schemaModel = require('../app/database/schema');

module.exports.up = async function (knex) {
	try {
		await schemaModel.default.addUUIDToAllSchemas(knex);
	} catch (e) {
		// eslint-disable-next-line
		console.error(e);
	}
};

module.exports.down = async function () {};
