CREATE TABLE `schema_hit`
		(
			`client_id` int(11)                                                       DEFAULT NULL,
			`region` 	  varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
			`entity`    varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
			`property`  varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
			`day`       date                                                          NOT NULL,
			`hits`      bigint(20)                                                    DEFAULT NULL,
			`updated_time` BIGINT NULL DEFAULT NULL
		) ENGINE = InnoDB
		  DEFAULT CHARSET = utf8mb4
		  COLLATE = utf8mb4_general_ci;

ALTER TABLE `schema_hit`
	ADD UNIQUE INDEX (`client_id`, `region`, `entity`, `property`, `day`);

ALTER TABLE `schema_hit`
	ADD INDEX (`entity`, `property`);
