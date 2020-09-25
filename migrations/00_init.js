exports.up = async (knex) => {
	await knex.raw(`
		CREATE TABLE \`persisted_queries\`
		(
			\`key\`          varchar(100) NOT NULL,
			\`query\`        text         NOT NULL,
			\`is_active\`    int          NOT NULL DEFAULT '1',
			\`updated_time\` datetime              DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
			\`added_time\`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (\`key\`)
		) ENGINE = InnoDB
		  DEFAULT CHARSET = utf8mb4
		  COLLATE = utf8mb4_general_ci;
	`);

	await knex.raw(`
		CREATE TABLE \`services\`
		(
			\`id\`           int unsigned NOT NULL AUTO_INCREMENT,
			\`name\`         varchar(255) NOT NULL DEFAULT '',
			\`is_active\`    int          NOT NULL DEFAULT '1',
			\`updated_time\` datetime              DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
			\`added_time\`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (\`id\`),
			UNIQUE KEY \`name\` (\`name\`)
		) ENGINE = InnoDB
		  AUTO_INCREMENT = 3
		  DEFAULT CHARSET = utf8mb4
		  COLLATE = utf8mb4_general_ci;
	`);

	await knex.raw(`
		CREATE TABLE \`schema\`
		(
			\`id\`           int unsigned NOT NULL AUTO_INCREMENT,
			\`service_id\`   int unsigned          DEFAULT NULL,
			\`is_active\`    tinyint               DEFAULT '1' COMMENT 'If schema is deleted, this is set to 0',
			\`type_defs\`    text COMMENT 'Graphql schema definition for specific service',
			\`added_time\`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of first registration',
			\`updated_time\` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of last registration OR deactivation',
			PRIMARY KEY (\`id\`),
			KEY \`service_id\` (\`service_id\`),
			CONSTRAINT \`schema_ibfk_1\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
		) ENGINE = InnoDB
		  AUTO_INCREMENT = 2
		  DEFAULT CHARSET = utf8mb4
		  COLLATE = utf8mb4_general_ci;
	`);

	await knex.raw(`
		CREATE TABLE \`container_schema\`
		(
			\`id\`         int unsigned NOT NULL AUTO_INCREMENT,
			\`service_id\` int unsigned NOT NULL,
			\`schema_id\`  int unsigned NOT NULL,
			\`version\`    varchar(100) NOT NULL DEFAULT '',
			\`added_time\` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (\`id\`),
			UNIQUE KEY \`service_id\` (\`service_id\`, \`version\`),
			KEY \`schema_id\` (\`schema_id\`),
			CONSTRAINT \`container_schema_ibfk_1\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
			CONSTRAINT \`container_schema_ibfk_2\` FOREIGN KEY (\`schema_id\`) REFERENCES \`schema\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
		) ENGINE = InnoDB
		  AUTO_INCREMENT = 2
		  DEFAULT CHARSET = utf8mb4
		  COLLATE = utf8mb4_general_ci;
	`);
};

exports.down = async (knex) => {};
