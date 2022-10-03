ALTER TABLE `clients_persisted_queries_rel` ADD `added_time` DATETIME  NULL  DEFAULT CURRENT_TIMESTAMP AFTER `pq_key`;

ALTER TABLE `clients_persisted_queries_rel` 
CHANGE `pq_key` `pq_key` VARCHAR(100) 
CHARACTER SET utf8mb4  
COLLATE utf8mb4_general_ci  NOT NULL  DEFAULT '';
