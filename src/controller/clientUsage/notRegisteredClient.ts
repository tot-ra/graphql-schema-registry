import { ClientUsageStrategy } from '../clientUsage';
import { gql } from '@apollo/client/core';
import { OperationDefinitionNode } from 'graphql';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { OperationParamsTransactionalRepository } from '../../database/schemaBreakdown/operation_params';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { transact } from '../../database';
import { ClientRepository } from '../../database/client';
import crypto from 'crypto';
import redisWrapper from '../../redis';

const { Report } = require('apollo-reporting-protobuf');

export class NotRegisteredClientStrategy implements ClientUsageStrategy {
	private operationRepository =
		OperationTransactionalRepository.getInstance();
	private operationParamRepository =
		OperationParamsTransactionalRepository.getInstance();
	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();
	private clientRepository = ClientRepository.getInstance();

	constructor(
		private decodedReport: typeof Report,
		private clientName: string,
		private clientVersion: string
	) {}

	async execute() {
		const ops = Object.keys(this.decodedReport.tracesPerQuery);
		const op = ops[0];
		const definition = gql`
			${op}
		`;
		const outerPromises = definition.definitions.map(
			async (clientOp: OperationDefinitionNode) => {
				const promises = clientOp.selectionSet.selections.map((q) => {
					return this.mapOperation(q);
				});
				const inner = await Promise.all(promises);
				return inner[0];
			}
		);
		let operations = await Promise.all(outerPromises);
		return await transact(async (trx) => {
			const clientPayload = {
				name: this.clientName,
				version: this.clientVersion,
			};
			await this.clientRepository.insertClient(trx, clientPayload);
			const client = await this.clientRepository.getClientByUniqueTrx(
				trx,
				this.clientName,
				this.clientVersion
			);
			const hash = crypto.createHash('md5').update(op).digest('hex');
			const payload = {
				query: {
					name: op.match(/# (\w+)/)[1],
					sdl: op.replace(/# \w+/, '').trim(),
				},
				operations,
			};
			const ttl = 24 * 3600 * 30;
			await redisWrapper.set(
				`o_${client.id}_${hash}`,
				JSON.stringify(payload),
				ttl
			);
			//TODO Sync with Marc
			//TODO Check if errors
			await redisWrapper.set(
				`e_${client.id}_${hash}_000000`,
				JSON.stringify({
					success: 1,
					error: 0,
				}),
				ttl
			);
		});
	}

	private async mapOperation(op: any) {
		const operationName = op.name.value;
		const operation = await this.operationRepository.getOperationByName(
			operationName
		);
		const outputParam =
			await this.operationParamRepository.getOperationParamOutputByParent(
				operation.id
			);
		const outputType = await this.typeRepository.getTypeById(
			outputParam.type_id
		);
		const entities = await this.getFields(
			op.selectionSet.selections,
			outputType.id
		);
		const result = {
			id: operation.id,
			entities: [],
		};
		entities.forEach((value, key) => {
			result.entities.push({
				objectId: key,
				fields: value,
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
			this.insertIntoMap(entities, parentId, f.id);
			if (field.selectionSet) {
				const subfields = await this.getFields(
					field.selectionSet.selections,
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
