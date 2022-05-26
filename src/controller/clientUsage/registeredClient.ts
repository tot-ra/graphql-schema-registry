import { getTimestamp } from '../../redis/utils';

const { Report } = require('apollo-reporting-protobuf');
import { ClientUsageStrategy } from '../clientUsage';
import { Client } from '../../model/client';
import redisWrapper from '../../redis';
import crypto from 'crypto';

export class RegisteredClientStrategy implements ClientUsageStrategy {
	constructor(private decodedReport: typeof Report, private client: Client) {}

	async execute() {
		const ops = Object.keys(this.decodedReport.tracesPerQuery);
		const op = ops[0];
		const hash = crypto.createHash('md5').update(op).digest('hex');
		const redisKey = `o_${this.client.id}_${hash}`;
		const operation = await redisWrapper.get(redisKey);
		if (!operation) {
			return;
		}
		const key = `${this.client.id}_${hash}-${getTimestamp()}`;
		const isError =
			'error' in this.decodedReport.tracesPerQuery[op].trace[0].root;
		await redisWrapper.incr(`${isError ? 'e' : 's'}_${key}`);
	}
}
