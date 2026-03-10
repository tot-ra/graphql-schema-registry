import { Kind, parse } from 'graphql';
import { Knex } from 'knex';
import { connection, transact } from './index';
import { rowsFromRaw } from './raw-results';

interface PushSubscriptionSourceInput {
	name: string;
	version: string;
	ws_url?: string;
	type_defs: string;
}

interface SubscriptionArgument {
	name: string;
	type: string;
	defaultValue: string | null;
	required: boolean;
}

function typeNodeToString(node: any): string {
	if (!node) {
		return '';
	}

	if (node.kind === Kind.NAMED_TYPE) {
		return node.name.value;
	}

	if (node.kind === Kind.LIST_TYPE) {
		return `[${typeNodeToString(node.type)}]`;
	}

	if (node.kind === Kind.NON_NULL_TYPE) {
		return `${typeNodeToString(node.type)}!`;
	}

	return '';
}

function valueNodeToString(node: any): string | null {
	if (!node) {
		return null;
	}

	if (node.kind === Kind.NULL) {
		return 'null';
	}

	if (node.kind === Kind.LIST) {
		return `[${node.values.map(valueNodeToString).join(', ')}]`;
	}

	if (node.kind === Kind.OBJECT) {
		const properties = node.fields.map((field) => {
			return `${field.name.value}: ${valueNodeToString(field.value)}`;
		});
		return `{${properties.join(', ')}}`;
	}

	if ('value' in node) {
		return String(node.value);
	}

	return null;
}

function extractSubscriptionDefinitions(typeDefs: string) {
	const ast = parse(typeDefs);
	const subscriptionType = ast.definitions.find((definition: any) => {
		return (
			definition.kind === Kind.OBJECT_TYPE_DEFINITION &&
			definition.name?.value === 'Subscription'
		);
	}) as any;

	if (!subscriptionType?.fields?.length) {
		return [];
	}

	return subscriptionType.fields.map((field) => {
		const args: SubscriptionArgument[] = (field.arguments || []).map((arg) => {
			const type = typeNodeToString(arg.type);
			return {
				name: arg.name.value,
				type,
				defaultValue: valueNodeToString(arg.defaultValue),
				required: type.endsWith('!'),
			};
		});

		return {
			name: field.name.value,
			payloadType: typeNodeToString(field.type),
			arguments: args,
		};
	});
}

const subscriptionsModel = {
	pushSubscriptionSource: async function ({
		source,
	}: {
		source: PushSubscriptionSourceInput;
	}) {
		const definitions = extractSubscriptionDefinitions(source.type_defs);
		const now = new Date();

		return transact(async (trx: Knex) => {
			const existingSource = await trx('subscription_sources')
				.where({
					name: source.name,
					version: source.version,
				})
				.first();

			let sourceId = existingSource?.id;

			if (sourceId) {
				await trx('subscription_sources')
					.where({ id: sourceId })
					.update({
						ws_url: source.ws_url || '',
						type_defs: source.type_defs,
						updated_time: now,
						is_active: 1,
					});

				await trx('subscription_definitions')
					.where({ source_id: sourceId })
					.del();
			} else {
				const inserted = await trx('subscription_sources')
					.insert({
						name: source.name,
						version: source.version,
						ws_url: source.ws_url || '',
						type_defs: source.type_defs,
						added_time: now,
						updated_time: now,
					})
					.returning('id');

				sourceId = Number(inserted[0]?.id || inserted[0]);
			}

			if (definitions.length > 0) {
				const rows = definitions.map((definition) => ({
					source_id: sourceId,
					name: definition.name,
					payload_type: definition.payloadType,
					arguments: JSON.stringify(definition.arguments),
					added_time: now,
					updated_time: now,
				}));

				await trx('subscription_definitions').insert(rows);
			}

			return {
				id: Number(sourceId),
				name: source.name,
				version: source.version,
				ws_url: source.ws_url || '',
				definitionsCount: definitions.length,
			};
		});
	},

	listLatestSources: async function () {
		const raw = await connection.raw(
			`SELECT DISTINCT ON (s.name)
					s.id,
					s.name,
					s.version,
					s.ws_url as "wsUrl",
					s.type_defs as "typeDefs",
					s.added_time as "addedTime",
					s.updated_time as "updatedTime",
					(
						SELECT COUNT(*)
						FROM subscription_definitions d
						WHERE d.source_id = s.id
					)::int as "definitionsCount"
			 FROM subscription_sources s
			 WHERE s.is_active::text IN ('1','t','true')
			 ORDER BY s.name, s.added_time DESC, s.id DESC`
		);

		return rowsFromRaw(raw).map((row) => ({
			...row,
			id: Number(row.id),
			definitionsCount: Number(row.definitionsCount || 0),
		}));
	},

	listDefinitions: async function ({
		sourceName,
		sourceIds,
	}: {
		sourceName?: string;
		sourceIds?: number[];
	} = {}) {
		const params: Array<string | number> = [];
		let where = `WHERE s.is_active::text IN ('1','t','true')
					AND d.is_active::text IN ('1','t','true')`;

		if (sourceName) {
			params.push(sourceName);
			where += ` AND s.name = ?`;
		}

		if (sourceIds && sourceIds.length > 0) {
			where += ` AND s.id IN (${sourceIds.map(() => '?').join(',')})`;
			params.push(...sourceIds);
		}

		const raw = await connection.raw(
			`SELECT d.id,
					s.id as "sourceId",
					s.name as "sourceName",
					s.version as "sourceVersion",
					s.ws_url as "wsUrl",
					d.name,
					d.payload_type as "payloadType",
					d.arguments,
					d.added_time as "addedTime",
					d.updated_time as "updatedTime"
			 FROM subscription_definitions d
			 INNER JOIN subscription_sources s ON s.id = d.source_id
			 ${where}
			 ORDER BY s.name, d.name`,
			params
		);

		return rowsFromRaw(raw).map((row) => {
			let args = row.arguments;
			if (typeof args === 'string') {
				try {
					args = JSON.parse(args);
				} catch (_) {
					args = [];
				}
			}

			return {
				...row,
				id: Number(row.id),
				sourceId: Number(row.sourceId),
				arguments: args || [],
			};
		});
	},
};

export default subscriptionsModel;
