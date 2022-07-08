import {
	ClientOperationsDTO,
	Executions,
	ExecutionsDAO,
	FieldClientVersion,
	FieldUsageResponse,
} from '../../model/client_usage';
import { RedisRepository } from '../../redis/redis';
import { KeyHandler } from '../../redis/key_handler';
import {
	ClientDTO,
	ClientRepository,
	ClientVersion,
} from '../../database/client';
import { parseInputDate } from '../utils';

export default async function getFieldUsageTrack(
	_parent,
	{ id, startDate, endDate }
): Promise<FieldUsageResponse> {
	const redisRepo = RedisRepository.getInstance();
	const clientRepo = ClientRepository.getInstance();
	const keyHandler = new KeyHandler();

	const operations = await redisRepo.getOperationsByUsage(id, 'field');
	const executions: Promise<ExecutionsDAO>[] = [];
	const clientIds = [];
	operations.forEach((_o, key) => {
		const { hash, clientId } = keyHandler.parseOperationKey(key);
		clientIds.push(clientId);
		executions.push(
			redisRepo.getExecutionsFromOperation({
				clientId,
				hash,
				startSeconds: parseInputDate(startDate),
				endSeconds: parseInputDate(endDate),
			})
		);
	});

	const clients = await clientRepo.getClientsByIds(clientIds);
	const resultExecutions = await Promise.all(executions);

	const operationUsage = mapToUsageResponse(
		clients,
		operations,
		resultExecutions
	);
	return operationUsage.sort((a, b) => {
		return a.client.name.localeCompare(b.client.name);
	});
}

function mapToUsageResponse(
	clients: ClientDTO[],
	operations: ClientOperationsDTO,
	executions: ExecutionsDAO[]
): FieldUsageResponse {
	return clients.map((c) => {
		const versions = calculateVersionExecutions(c.versions, executions);
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

export function calculateVersionExecutions(
	clientVersions: ClientVersion[],
	executions: ExecutionsDAO[]
): FieldClientVersion[] {
	return clientVersions.map((client) => {
		const { id, tag } = client;
		const clientExecutions = executions.filter(
			(exec) => exec.clientId === id
		);

		const groupExecutions = clientExecutions.reduce(
			(acc, cur) => {
				acc.success += cur.success;
				acc.error += cur.error;
				acc.total += cur.total;
				return acc;
			},
			{
				success: 0,
				error: 0,
				total: 0,
			} as Executions
		);
		return {
			id: tag,
			execution: groupExecutions,
		};
	});
}
