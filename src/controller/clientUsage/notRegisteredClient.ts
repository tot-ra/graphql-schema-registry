import { gql } from '@apollo/client/core';
import { DefinitionNode, OperationDefinitionNode } from 'graphql';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { OperationParamsTransactionalRepository } from '../../database/schemaBreakdown/operation_params';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import redisWrapper from '../../redis';
import { getTimestamp } from '../../redis/utils';
import { Client } from '../../model/client';
import { QueryResult } from '../../model/usage_counter';

export class RegisterUsage {
	private operationRepository =
		OperationTransactionalRepository.getInstance();
	private operationParamRepository =
		OperationParamsTransactionalRepository.getInstance();
	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();

	constructor(
		private op: string,
		private client: Client,
		private queryResult: QueryResult,
		private hash: string
	) {}

	async execute() {
		if (!this.client) {
			return;
		}
		const definition = gql`
			${this.op}
		`;
		const [fragments, operations] = definition.definitions.reduce(
			(acc, cur) => {
				acc[cur.kind === 'FragmentDefinition' ? 0 : 1].push(cur);
				return acc;
			},
			[[] as DefinitionNode[], [] as DefinitionNode[]]
		);

		const outerPromises = operations.map(
			async (clientOp: OperationDefinitionNode) => {
				const promises = clientOp.selectionSet.selections
					.filter((op: any) => !(op.name?.value).startsWith('__'))
					.map((q) => {
						return this.mapOperation(q, fragments);
					});
				return await Promise.all(promises);
			}
		);
		let operationsResult = await Promise.all(outerPromises);
		await this.insertInRedis(operationsResult);
	}

	private async insertInRedis(operations: any) {
		const payload = {
			query: {
				name: this.op.match(/# (\w+)/)[1],
				sdl: this.op.replace(/# \w+/, '').trim(),
			},
			operations: operations[0],
		};
		const ttl = 24 * 3600 * 30;
		await redisWrapper.set(
			`o_${this.client.id}_${this.hash}`,
			JSON.stringify(payload),
			ttl
		);
		await redisWrapper.set(
			`s_${this.client.id}_${this.hash}_${getTimestamp()}`,
			this.queryResult.success,
			ttl
		);
		await redisWrapper.set(
			`e_${this.client.id}_${this.hash}_${getTimestamp()}`,
			this.queryResult.errors,
			ttl
		);
	}

	private async mapOperation(op: any, outerFragments: any[]) {
		const operationName = op.name.value;
		const operation = await this.operationRepository.getOperationByName(
			operationName
		);
		if (!operation) {
			return;
		}
		const outputParam =
			await this.operationParamRepository.getOperationParamOutputByParent(
				operation.id
			);
		const outputType = await this.typeRepository.getTypeById(
			outputParam.type_id
		);
		const [fragments, fields] = op.selectionSet.selections
			.filter(
				(selection: any) => !(selection.name?.value).startsWith('__')
			)
			.reduce(
				(acc, cur) => {
					acc[cur.kind === 'FragmentSpread' ? 0 : 1].push(cur);
					return acc;
				},
				[[] as any[], [] as any[]]
			);

		const entityPromises = fragments.map((f) => {
			const outerFragment = outerFragments.find(
				(of) => of.name.value === f.name.value
			);
			if (!outerFragment) {
				return null;
			}
			return this.getFields(
				outerFragment.selectionSet.selections.filter(
					(selection: any) =>
						!(selection.name?.value).startsWith('__')
				),
				outputType.id
			);
		});

		const response = await Promise.all(entityPromises);
		const fragmentEntities = response.filter(Boolean);

		const entities = await this.getFields(fields, outputType.id);
		const mergedEntities = [...fragmentEntities, entities];
		const result = {
			id: operation.id,
			entities: [],
		};
		mergedEntities.forEach((m) => {
			m.forEach((value, key) => {
				const existingEntity = result.entities.find(
					(e) => e.objectId === key
				);
				if (existingEntity) {
					existingEntity.fields = existingEntity.fields.concat(value);
				} else {
					result.entities.push({
						objectId: key,
						fields: value,
					});
				}
			});
		});

		return result;
	}

	private async getFields(
		objs: any[],
		parentId: number
	): Promise<Map<number, number[]>> {
		let entities = new Map();
		for (const field of objs) {
			const fieldName = field.name.value;
			const f = await this.fieldRepository.getFieldByNameAndParent(
				fieldName,
				parentId
			);
			if (!f) {
				return entities;
			}
			this.insertIntoMap(entities, parentId, f.id);
			if (field.selectionSet) {
				const subfields = await this.getFields(
					field.selectionSet.selections.filter(
						(selection: any) =>
							!(selection.name?.value).startsWith('__')
					),
					f.children_type_id
				);
				subfields.forEach((value, key) => {
					value.forEach((field) =>
						this.insertIntoMap(entities, key, field)
					);
				});
			}
		}
		return entities;
	}

	private insertIntoMap(
		map: Map<number, number[]>,
		key: number,
		value: number
	) {
		if (map.has(key)) {
			map.set(key, [...map.get(key), value]);
		} else {
			map.set(key, [value]);
		}
	}
}
