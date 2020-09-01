const { knex } = require("./index");

exports.getSchemaContainers = async ({
	schemaId,
	limit = 100,
	offset = 0,
	trx = knex
}) => {
	return trx("container_schema")
		.select(
			"container_schema.id",
			"container_schema.version",
			"container_schema.added_time as addedTime",
			"services.name as serviceName"
		)
		.leftJoin("schema", "schema.id", "container_schema.schema_id")
		.leftJoin("services", "services.id", "schema.service_id")
		.where("schema_id", "=", schemaId)
		.orderBy("container_schema.added_time")
		.offset(offset)
		.limit(limit);
};

exports.getSchemaContainerCount = async ({ schemaId, trx = knex }) => {
	const result = await trx("container_schema")
		.count("id", { as: "cnt" })
		.where("schema_id", "=", schemaId)
		.andWhere("version", "<>", "latest");

	return result[0].cnt;
};

exports.isDev = async ({ schemaId, trx = knex }) => {
	const result = await trx("container_schema")
		.count("id", { as: "cnt" })
		.where("schema_id", "=", schemaId)
		.andWhere("version", "=", "latest");

	return Boolean(result[0].cnt);
};
