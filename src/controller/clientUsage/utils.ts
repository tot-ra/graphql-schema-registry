import { Client, ClientPayload } from '../../model/client';
import { ClientRepository } from '../../database/client';

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
	const repository = ClientRepository.getInstance();
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
