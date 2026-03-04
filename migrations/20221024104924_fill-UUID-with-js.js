const crypto = require('crypto');

function generateUUID(typeDefs) {
	return crypto
		.createHash('md5')
		.update(typeDefs || '')
		.digest('hex');
}

module.exports.up = async function (knex) {
	try {
		const rows = await knex('schema')
			.select(['id', 'type_defs'])
			.whereNull('uuid');

		for (const row of rows) {
			await knex('schema')
				.where({ id: row.id })
				.update({
					uuid: generateUUID(row.type_defs),
				});
		}
	} catch (e) {
		// eslint-disable-next-line
		console.error(e);
		throw e;
	}
};

module.exports.down = async function () {};
