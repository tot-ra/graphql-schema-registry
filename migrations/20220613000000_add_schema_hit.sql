CREATE TABLE IF NOT EXISTS `clients` (
										 `id` int(11) NOT NULL AUTO_INCREMENT,
										 `name` varchar(50) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
										 `version` varchar(50) CHARACTER SET utf8mb4 DEFAULT '',
										 `calls` bigint(20) DEFAULT NULL,
										 `updated_time` datetime DEFAULT CURRENT_TIMESTAMP,
										 `added_time` DATETIME  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
										 PRIMARY KEY (`id`),
										 UNIQUE KEY `name_version` (`name`,`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clients_persisted_queries_rel` (
															   `version_id` int(11) NOT NULL,
															   `pq_key` varchar(100) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
															   UNIQUE KEY `version_id_2` (`version_id`,`pq_key`),
															   KEY `version_id` (`version_id`),
															   KEY `pq_key` (`pq_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE `schema_hit`
		(
			`client_id` int(11)                                                       DEFAULT NULL,
			`entity`    varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
			`property`  varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
			`day`       date                                                          NOT NULL,
			`hits`      bigint(20)                                                    DEFAULT NULL,
			`updated_time` BIGINT NULL DEFAULT NULL,
			UNIQUE KEY `client_id` (`client_id`,`entity`,`property`,`day`),
			KEY `entity` (`entity`,`property`)
		) ENGINE = InnoDB
		  DEFAULT CHARSET = utf8mb4
		  COLLATE = utf8mb4_general_ci;
