import { createHash } from 'crypto';
import { connection } from '../../database';
import schemaModel from '../../database/schema';
import { getSuperGraph } from '../../helpers/federation';
import { FetchError } from 'node-fetch';

export const DEFAULT_SUPER_GRAPH_MIN_DELAY_SECONDS = 30;
const SUPER_GRAPH_ID_SIZE = 6;

interface RouterConfigParams {
	ref: string;
	apiKey: string;
	ifAfterId: string;
}

interface RouterConfigResult {
	id: string;
	minDelaySeconds: number;
	supergraphSDL: string;
}

type Unchanged = Omit<RouterConfigResult, 'supergraphSDL'>;

type GetRouterConfig = Promise<RouterConfigResult | Unchanged | FetchError>;

export default async (
	_,
	{ ifAfterId }: RouterConfigParams
): GetRouterConfig => {
	const schemas = await schemaModel.getLastUpdatedForActiveServices({
		trx: connection,
	});

	const supergraphSDL = getSuperGraph(schemas);
	const id = createHash('md5')
		.update(supergraphSDL)
		.digest('hex')
		.slice(0, SUPER_GRAPH_ID_SIZE);

	const minDelaySeconds = process.env.SUPER_GRAPH_MIN_DELAY_SECONDS
		? parseInt(process.env.SUPER_GRAPH_MIN_DELAY_SECONDS, 10)
		: DEFAULT_SUPER_GRAPH_MIN_DELAY_SECONDS;

	if (ifAfterId === id) {
		return { id, minDelaySeconds };
	}

	return { id, minDelaySeconds, supergraphSDL };
};
