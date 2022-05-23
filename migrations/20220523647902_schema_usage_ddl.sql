CREATE TABLE IF NOT EXISTS `clients` (
	`id` int UNSIGNED NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`version` VARCHAR(20) NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `name` (`name`, `version`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
