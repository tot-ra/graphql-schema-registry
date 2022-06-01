import {
	ClientOperationsDTO,
	ClientVersion,
	ExecutionsDAO,
	OperationExecutions,
	OperationUsageResponse,
} from '../../model/client_usage';
import { RedisRepository } from '../../redis/redis';
import { KeyHandler } from '../../redis/key_handler';
import { ClientRepository } from '../../database/client';

interface ClientDAO {
	name: string;
	id: number;
	version: string;
}

interface Client {
	name: string;
	versions: {
		id: number;
		tag: string;
	}[];
}

export default async function getOperationUsageTrack(
	_parent,
	{ id, startDate, endDate }
): Promise<OperationUsageResponse> {
	const redisRepo = RedisRepository.getInstance();
	const clientRepo = ClientRepository.getInstance();
	const keyHandler = new KeyHandler();

	const operations = await redisRepo.getOperationsByUsage(id, 'operation');
	const executions: Promise<ExecutionsDAO>[] = [];
	const clients: Promise<ClientDAO>[] = [];
	operations.forEach((_o, key) => {
		const { hash, clientId } = keyHandler.parseOperationKey(key);
		executions.push(
			redisRepo.getExecutionsFromOperation({
				hash,
				startSeconds: parseInputDate(startDate),
				endSeconds: parseInputDate(endDate),
			})
		);
		clients.push(clientRepo.getClientById(clientId));
	});

	const resultClients = await Promise.all(clients);
	const groupedClients = groupClientsByName(resultClients);

	const resultExecutions = await Promise.all(executions);

	const operationUsage: OperationUsageResponse = mapToOperationUsageResponse(
		groupedClients,
		operations,
		resultExecutions,
		keyHandler
	);
	return operationUsage.sort((a, b) => {
		return a.client.name.localeCompare(b.client.name);
	});
}

function groupClientsByName(clients: ClientDAO[]): Client[] {
	return clients.reduce((acc, client) => {
		const { name, id, version } = client;
		const existingClient = acc.find((c) => c.name === name);
		if (existingClient) {
			existingClient.versions.push({ id, tag: version });
		} else {
			acc.push({
				name,
				versions: [{ id, tag: version }],
			});
		}
		return acc;
	}, [] as Client[]);
}

function mapToOperationUsageResponse(
	clients: Client[],
	operations: ClientOperationsDTO,
	executions: ExecutionsDAO[],
	keyHandler: KeyHandler
): OperationUsageResponse {
	return clients.map((c) => {
		const versions: ClientVersion[] = [];
		operations.forEach((operation, key) => {
			c.versions.forEach((version) => {
				const { id, tag } = version;
				const { hash, clientId } = keyHandler.parseOperationKey(key);
				if (clientId === id) {
					const existingVersionTag = versions.find(
						(v) => v.id === tag
					);
					if (existingVersionTag) {
						existingVersionTag.operations.push({
							name: operation.query.name,
							executions: executions.find((e) => e.hash === hash),
						});
					} else {
						versions.push({
							id: tag,
							operations: [
								{
									name: operation.query.name,
									executions: executions.find(
										(e) => e.hash === hash
									),
								},
							],
						});
					}
				}
			});
		});
		return {
			client: {
				name: c.name,
				versions: versions.sort((a, b) => {
					return b.id.localeCompare(a.id);
				}),
			},
		};
	});
}

export function parseInputDate(date: string): number {
	return Math.floor(new Date(date).getTime() / 1000);
}
