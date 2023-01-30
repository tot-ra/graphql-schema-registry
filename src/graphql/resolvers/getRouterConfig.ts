import { createHash } from 'crypto';
import { connection } from '../../database';
import schemaModel from '../../database/schema';
import { getSuperGraph } from '../../helpers/federation';

const DEFAULT_SUPER_GRAPH_MIN_DELAY_SECONDS = 30;
const SUPER_GRAPH_ID_SIZE = 6;

export default async () => {
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

	return { id, minDelaySeconds, supergraphSDL };
};
