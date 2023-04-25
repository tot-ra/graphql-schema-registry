import { Report, IReport } from 'apollo-reporting-protobuf';
import { ClientRepository } from '../database/client';
import { Client, ClientPayload } from '../model/client';
import { registerFieldsUsage } from './clientUsage/registerFieldsUsage';
import { registerRootFieldsUsage } from './clientUsage/registerRootFieldsUsage';
import {
	getOperationClients,
	getOperationClientStats,
	parseOperationSdl,
} from './clientUsage/utils';

export class ClientUsageController {
	private clientRepository = ClientRepository.getInstance();

	async registerUsage(buffer: Buffer): Promise<void> {
		const { tracesPerQuery } = Report.decode(buffer).toJSON() as IReport;

		if (!tracesPerQuery) {
			return;
		}

		const usageDataPerQueryEntries = Object.entries(tracesPerQuery);

		await Promise.all(
			usageDataPerQueryEntries
				.filter(([operationSdl]) => {
					const notSupportedOperations = [
						'IntrospectionQuery',
						'GraphQLValidationFailure',
						'GraphQLParseFailure',
					];

					const arrayNotSupportedOperations =
						notSupportedOperations.map((nSO) =>
							operationSdl.includes(nSO)
						);

					return !arrayNotSupportedOperations.find(
						(identity) => identity
					);
				})
				.map(async ([operationSdl, usageData]) => {
					const clients = await getOperationClients(usageData);
					const parsedOperationSdl = parseOperationSdl(operationSdl);

					await Promise.all(
						clients.map(async (client) => {
							if (!client.name || !client.version) {
								return;
							}
							const operationClientStats =
								getOperationClientStats(client, usageData);

							const registeredClient = await this.registerClient(
								client
							);

							await registerRootFieldsUsage(
								parsedOperationSdl,
								registeredClient,
								operationClientStats
							);
							await registerFieldsUsage(
								parsedOperationSdl,
								registeredClient,
								operationClientStats
							);
						})
					);
				})
		);
	}

	private async registerClient(client: ClientPayload): Promise<Client> {
		let registeredClient = await this.clientRepository.getClientByUnique(
			client.name,
			client.version
		);

		if (!registeredClient) {
			try {
				await this.clientRepository.insertClient(client);
			} catch (error) {
				// Does not log error in case of race condition
				if (!error?.message?.includes('Duplicate entry')) {
					throw error;
				}
			}
			registeredClient = await this.clientRepository.getClientByUnique(
				client.name,
				client.version
			);
		}
		return registeredClient;
	}
}
