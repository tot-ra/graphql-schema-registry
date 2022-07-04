import { ClientRepository } from '../database/client';

const { Report } = require('apollo-reporting-protobuf');
import { RegisterUsage } from './clientUsage/notRegisteredClient';
import { UpdateUsageStrategy } from './clientUsage/registeredClient';
import redisWrapper from '../redis';
import crypto from 'crypto';
import { getClientsFromTrace } from './clientUsage/utils';
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
				if (!decodedReport.tracesPerQuery[query].trace) {
					return;
				}
				const traces = decodedReport.tracesPerQuery[query].trace.filter(
					(trace) =>
						trace.clientName === client.name &&
						trace.clientVersion === client.version
				);
				return this.registerClient(query, client, traces, hash);
			});

			return Promise.all(clientPromises);
		});

		return Promise.all(promises);
	}

	private async registerClient(
		query: string,
		clientPayload: ClientPayload,
		traces: any[],
		hash: string
	): Promise<void> {
		let client = await this.clientRepository.getClientByUnique(
			clientPayload.name,
			clientPayload.version
		);

		const queryResult = traces.reduce(
			(acc, cur) => {
				const isError = 'error' in cur.root;
				acc[isError ? 'errors' : 'success']++;
				return acc;
			},
			{
				errors: 0,
				success: 0,
			} as QueryResult
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
