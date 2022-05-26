import { getTimestamp } from '../../redis/utils';

import redisWrapper from '../../redis';

export class UpdateUsageStrategy {
	constructor(private isError: boolean, private clientId: number, private hash: string) {}

	async execute() {
		const redisKey = `o_${this.clientId}_${this.hash}`;
		const key = `${this.clientId}_${this.hash}-${getTimestamp()}`;
		await redisWrapper.incr(`${this.isError ? 'e' : 's'}_${key}`);
	}
}
