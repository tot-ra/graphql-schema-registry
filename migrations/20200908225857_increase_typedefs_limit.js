exports.up = async function (knex) {
	await knex.raw(`ALTER TABLE \`schema\`
		CHANGE \`type_defs\` \`type_defs\` MEDIUMTEXT
			CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL
			COMMENT 'Graphql schema definition for specific service';
	`);
};

exports.down = function (knex) {};
