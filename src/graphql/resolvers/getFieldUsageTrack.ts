import {
	ClientOperationsDTO,
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
		resultExecutions,
		keyHandler
	);
	return operationUsage.sort((a, b) => {
		return a.client.name.localeCompare(b.client.name);
	});
}

function mapToUsageResponse(
	clients: ClientDTO[],
	operations: ClientOperationsDTO,
	executions: ExecutionsDAO[],
	keyHandler: KeyHandler
): FieldUsageResponse {
	return clients.map((c) => {
		const versions = calculateVersionExecutions(
			c.versions,
			operations,
			executions,
			keyHandler
		);
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
	operations: ClientOperationsDTO,
	executions: ExecutionsDAO[],
	keyHandler: KeyHandler
): FieldClientVersion[] {
	const versions: FieldClientVersion[] = [];
	operations.forEach((operation, key) => {
		clientVersions.forEach((version) => {
			const { id, tag } = version;
			const { hash, clientId } = keyHandler.parseOperationKey(key);
			if (clientId !== id) {
				return;
			}
			const execution = executions.find(
				(e) => e.hash === hash && e.clientId === clientId
			);
			if (!execution) {
				return;
			}

			versions.push({
				id: tag,
				execution,
			});
		});
	});
	return versions;
}
