ALTER TABLE `schema`
    ADD `UUID` VARCHAR(64) NULL DEFAULT NULL COMMENT 'used in uniqueness checks' AFTER `id`;
