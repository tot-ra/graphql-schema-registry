import { ClientRepository } from '../database/client';

const { Report } = require('apollo-reporting-protobuf');
import { RegisterUsage } from './clientUsage/notRegisteredClient';
import { UpdateUsageStrategy } from './clientUsage/registeredClient';
import redisWrapper from '../redis';
import crypto from 'crypto';
import { getClientsFromTrace, getUsagesForClients } from './clientUsage/utils';
import { ClientPayload } from '../model/client';
import { QueryResult } from '../model/usage_counter';
import { logger } from '../logger';

export class ClientUsageController {
	private clientRepository = ClientRepository.getInstance();

	async registerUsage(buffer: Buffer) {
		const decodedReport = Report.decode(buffer).toJSON();

		const queries = Object.keys(decodedReport.tracesPerQuery);

		const promises = queries.map(async (query) => {
			if (query.includes('IntrospectionQuery')) return null;
			const clients = await getClientsFromTrace(
				decodedReport.tracesPerQuery[query]
			);

			const hash = crypto.createHash('md5').update(query).digest('hex');

			const clientPromises = clients.map((client) => {
				const queryResult = getUsagesForClients(
					client,
					decodedReport.tracesPerQuery[query]
				);

				return this.registerClient(query, client, queryResult, hash);
			});

			return Promise.all(clientPromises);
		});

		return Promise.all(promises);
	}

	private async registerClient(
		query: string,
		clientPayload: ClientPayload,
		queryResult: QueryResult,
		hash: string
	): Promise<void> {
		let client = await this.clientRepository.getClientByUnique(
			clientPayload.name,
			clientPayload.version
		);

		if (!client || !(await redisWrapper.get(`o_${client.id}_${hash}`))) {
			if (!client) {
				await this.clientRepository.insertClient(clientPayload);
				client = await this.clientRepository.getClientByUnique(
					clientPayload.name,
					clientPayload.version
				);
			}
			return new RegisterUsage(
				query,
				client,
				queryResult,
				hash
			).execute();
		} else {
			return new UpdateUsageStrategy(
				queryResult,
				client.id,
				hash
			).execute();
		}
	}
}
