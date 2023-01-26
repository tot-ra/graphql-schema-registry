import { getTimestamp } from '../../redis/utils';

import redisWrapper from '../../redis';
import { UsageStats } from '../../model/usage_counter';

export class UpdateUsageStrategy {
	constructor(
		private queryResult: UsageStats,
		private clientId: number,
		private hash: string
	) {}

	async execute() {
		const key = `${this.clientId}_${this.hash}_${getTimestamp()}`;
		if (this.queryResult.error > 0) {
			await redisWrapper.incr(`e_${key}`, this.queryResult.error, 1000);
		}
		if (this.queryResult.success > 0) {
			await redisWrapper.incr(`s_${key}`, this.queryResult.success, 1000);
		}
	}
}
