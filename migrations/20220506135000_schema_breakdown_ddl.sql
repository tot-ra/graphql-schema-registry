CREATE TABLE IF NOT EXISTS `type_def_types` (
    `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `type` ENUM('OBJECT', 'SCALAR', 'INTERFACE', 'ENUM', 'INPUT', 'UNION', 'DIRECTIVE') NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `type_def_fields` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  	`name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `is_nullable` tinyint(1) NOT NULL DEFAULT 1,
    `is_array` tinyint(1) NOT NULL DEFAULT 0,
    `is_array_nullable` tinyint(1) NOT NULL DEFAULT 1,
    `is_deprecated` tinyint(1) NOT NULL DEFAULT 0,
  	`parent_type_id` INT UNSIGNED,
	`children_type_id` INT UNSIGNED,
    PRIMARY KEY (`id`),
  	FOREIGN KEY (`parent_type_id`) REFERENCES `type_def_types`(`id`),
    FOREIGN KEY (`children_type_id`) REFERENCES `type_def_types`(`id`),
    UNIQUE KEY `name` (`name`, `parent_type_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `type_def_operations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `type` ENUM('QUERY', 'MUTATION', 'SUBSCRIPTION') NOT NULL,
    `service_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`),
    UNIQUE KEY `name` (`name`, `type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `type_def_operation_parameters` (
    `operation_id` INT UNSIGNED,
    `type_id` INT UNSIGNED,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `is_nullable` tinyint(1) NOT NULL DEFAULT 1,
    `is_array` tinyint(1) NOT NULL DEFAULT 0,
    `is_array_nullable` tinyint(1) NOT NULL DEFAULT 1,
    `is_output` tinyint(1) NOT NULL,
    FOREIGN KEY (`operation_id`) REFERENCES `type_def_operations`(`id`),
    FOREIGN KEY (`type_id`) REFERENCES `type_def_types`(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `type_def_subgraphs` (
    `service_id` INT UNSIGNED,
    `type_id` INT UNSIGNED,
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`),
    FOREIGN KEY (`type_id`) REFERENCES `type_def_types`(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `type_def_implementations` (
    `interface_id` INT UNSIGNED,
    `implementation_id` INT UNSIGNED,
    FOREIGN KEY (`interface_id`) REFERENCES `type_def_types`(`id`),
    FOREIGN KEY (`implementation_id`) REFERENCES `type_def_types`(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `type_def_field_arguments` (
    `field_id` INT UNSIGNED,
    `argument_id` INT UNSIGNED,
    FOREIGN KEY (`field_id`) REFERENCES `type_def_fields`(`id`),
    FOREIGN KEY (`argument_id`) REFERENCES `type_def_fields`(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
