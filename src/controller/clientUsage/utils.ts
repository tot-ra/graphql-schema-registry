import { Client, ClientPayload } from '../../model/client';
import { ClientRepository } from '../../database/client';
import { QueryResult } from '../../model/usage_counter';

export function extractDefinitionData(definition: any): any {
	return definition.definitions
		?.map((def) => {
			return def.selectionSet.selections
				.map((op) => {
					return {
						operationName: op.name.value,
						fields: op.selectionSet.selections.map(
							(field) => field.name.value
						),
					};
				})
				.flat(1);
		})
		.flat(1);
}

export async function getClientsFromTrace(
	query: any
): Promise<ClientPayload[]> {
	let clients = [];
	if ('statsWithContext' in query) {
		clients = query['statsWithContext'].map((i) => {
			return {
				name: i.context.clientName,
				version: i.context.clientVersion,
			};
		});
	} else {
		const existingClients: boolean[] = [];
		query.trace.forEach((trace) => {
			const { clientName, clientVersion } = trace;
			const key = `${clientName}__${clientVersion}`;
			if (!existingClients[key]) {
				clients.push({
					name: clientName,
					version: clientVersion,
				});
				existingClients[key] = true;
			}
		});
	}
	return clients;
}

export function getUsagesForClients(
	client: ClientPayload,
	query: any
): QueryResult {
	const traces =
		query?.trace?.filter(
			(trace) =>
				trace.clientName === client.name &&
				trace.clientVersion === client.version
		) ?? [];

	const statsWithContext =
		query?.statsWithContext?.filter(
			(stat) =>
				stat.context.clientName === client.name &&
				stat.context.clientVersion === client.version
		) ?? [];

	const queryResult: QueryResult = {
		errors: 0,
		success: 0,
	};

	traces.forEach((trace) => {
		const isError = 'error' in trace.root;
		isError ? queryResult.errors++ : queryResult.success++;
	});

	statsWithContext.forEach((stat) => {
		const total = Number(stat.queryLatencyStats.requestCount);
		const totalErrors = Number(
			stat.queryLatencyStats.rootErrorStats.errorsCount
		);
		queryResult.errors += totalErrors;
		queryResult.success += total - totalErrors;
	});

	return queryResult;
}
