import {
	ExecutionsDAO,
	OperationExecutions,
	OperationUsageResponse,
} from '../../model/client_usage';
import { RedisRepository } from '../../redis/redis';
import { KeyHandler } from '../../redis/key_handler';
import { ClientRepository } from '../../database/client';

export default async function getOperationUsageTrack(
	_parent,
	{ id, startDate, endDate }
): Promise<OperationUsageResponse> {
	const redisRepo = RedisRepository.getInstance();
	const clientRepo = ClientRepository.getInstance();
	const keyHandler = new KeyHandler();

	const operations = await redisRepo.getOperationsByUsage(id, 'operation');
	const executions: Promise<ExecutionsDAO>[] = [];
	const clients: Promise<{ name: string; id: number; version: string }>[] =
		[];
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
	const resultExecutions = await Promise.all(executions);

	return {
		client: resultClients.map((c) => {
			const versionOperations: OperationExecutions[] = [];
			operations.forEach((operation, key) => {
				const { hash } = keyHandler.parseOperationKey(key);
				if (hash === key) {
					versionOperations.push({
						name: operation.query.name,
						executions: resultExecutions.find(
							(e) => e.hash === hash
						),
					});
				}
			});
			return {
				name: c.name,
				versions: [{ id: c.version, operations: versionOperations }],
			};
		}),
	};
}

export function parseInputDate(date: string): number {
	return Math.floor(new Date(date).getTime() / 1000);
}
