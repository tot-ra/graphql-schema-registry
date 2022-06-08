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
import { getTimestamp } from '../../redis/utils';

const { Report } = require('apollo-reporting-protobuf');

export class RegisterUsage {
	private operationRepository =
		OperationTransactionalRepository.getInstance();
	private operationParamRepository =
		OperationParamsTransactionalRepository.getInstance();
	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();
	private clientRepository = ClientRepository.getInstance();

	constructor(
		private op: string,
		private clientName: string,
		private clientVersion: string,
		private isError: boolean,
		private hash: string
	) {}

	async execute() {
		const definition = gql`
			${this.op}
		`;
		const outerPromises = definition.definitions.map(
			async (clientOp: OperationDefinitionNode) => {
				const promises = clientOp.selectionSet.selections.map((q) => {
					return this.mapOperation(q);
				});
				return await Promise.all(promises);
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
			if (!client) {
				return;
			}
			const payload = {
				query: {
					name: this.op.match(/# (\w+)/)[1],
					sdl: this.op.replace(/# \w+/, '').trim(),
				},
				operations: operations[0],
			};
			const ttl = 24 * 3600 * 30;
			await redisWrapper.set(
				`o_${client.id}_${this.hash}`,
				JSON.stringify(payload),
				ttl
			);
			await redisWrapper.set(
				`s_${client.id}_${this.hash}_${getTimestamp()}`,
				Number(!this.isError),
				ttl
			);
			await redisWrapper.set(
				`e_${client.id}_${this.hash}_${getTimestamp()}`,
				Number(this.isError),
				ttl
			);
		});
	}

	private async mapOperation(op: any) {
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
			if (f) {
				this.insertIntoMap(entities, parentId, f.id);
			}
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
