import { ClientRepository } from '../database/client';

const { Report } = require('apollo-reporting-protobuf');
import { RegisterUsage } from './clientUsage/notRegisteredClient';
import { UpdateUsageStrategy } from './clientUsage/registeredClient';
import redisWrapper from '../redis';
import crypto from 'crypto';

/*
const ops = Object.keys(this.decodedReport.tracesPerQuery);
		const op = ops[0];
		const hash = crypto.createHash('md5').update(op).digest('hex');
		const redisKey = `o_${this.client.id}_${hash}`;
		const operation = await redisWrapper.get(redisKey);
		if (!operation) {
			const newQuery = new NotRegisteredClientStrategy(this.decodedReport, this.c)
			return;
		}
		const key = `${this.client.id}_${hash}-${getTimestamp()}`;
		const isError =
			'error' in this.decodedReport.tracesPerQuery[op].trace[0].root;
		await redisWrapper.incr(`${isError ? 'e' : 's'}_${key}`);
 */
export class ClientUsageController {
	private clientRepository = ClientRepository.getInstance();

	async registerUsage(buffer: Buffer) {
		const decodedReport = Report.decode(buffer).toJSON();
		const firstQuery =
			decodedReport.tracesPerQuery[
				Object.keys(decodedReport.tracesPerQuery)[0]
			];
		const { clientName, clientVersion } = firstQuery.trace[0];

		const client = await this.clientRepository.getClientByUnique(
			clientName,
			clientVersion
		);
		const hash = crypto
			.createHash('md5')
			.update(Object.keys(decodedReport.tracesPerQuery)[0])
			.digest('hex');
		const isError = 'error' in firstQuery.trace[0].root;

		if (!client || !(await redisWrapper.get(`o_${client.id}_${hash}`))) {
			const strategy = new RegisterUsage(
				decodedReport,
				clientName,
				clientVersion,
				isError,
				hash
			);
			await strategy.execute();
			return;
		}

		return await new UpdateUsageStrategy(
			isError,
			client.id,
			hash
		).execute();
	}
}
