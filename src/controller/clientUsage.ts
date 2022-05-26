import {ClientRepository} from "../database/client";

const { Report } = require('apollo-reporting-protobuf');
import { gql } from '@apollo/client/core';
import {NotRegisteredClientStrategy} from "./clientUsage/notRegisteredClient";
import {RegisteredClientStrategy} from "./clientUsage/registeredClient";
import {Client} from "../model/client";

interface ClientUsageService {
	registerUsage(buffer: Buffer): Promise<void>;
}

export interface ClientUsageStrategy {
	execute(): Promise<void>
}

export class ClientUsageController implements ClientUsageService {

	private clientRepository = ClientRepository.getInstance();

	async registerUsage(buffer: Buffer) {
		const decodedReport = Report.decode(buffer).toJSON();
		const firstQuery = decodedReport.tracesPerQuery[Object.keys(decodedReport.tracesPerQuery)[0]];
		const { clientName, clientVersion } = firstQuery.trace[0];

		const client = await this.clientRepository.getClientByUnique(clientName, clientVersion);
		const strategy: ClientUsageStrategy =
			(!client) ? new NotRegisteredClientStrategy(decodedReport, clientName, clientVersion)
				: new RegisteredClientStrategy(decodedReport, client);
		return strategy.execute();
	}
}
// export async function registerUsage(buffer: Buffer) {
// 	console.log("CONTROLLER BUFFER");
// 	const decodedReport = Report.decode(buffer);
// 	const query = decodedReport.toJSON()
// 	const trace = query.tracesPerQuery;
// 	const keys = Object.keys(trace);
// 	const replacedQueries = keys.map(key => {
// 		const operationName = key.match(/# (\w+)/);
// 		return query.replace(/# \w+/, '').trim();
// 	})
// const query = "# homeBrands\nfragment HomeBrands on Brand{__typename brandId id logo title}query homeBrands($platform:Platform!){homepageB2cBrands(platform:$platform){__typename...HomeBrands}}";
// const queryDefinition = gql`${result}`
// console.log(`Apollo usage report: ${JSON.stringify(query)}`);
// }

/* CLIENT NOT FOUND
1. Remove # {name}\n
2. La parte derecha es el schema que he de guardar
3. Hago "gql" de la parte derecha
4. Encuentro la operationName y los fieldNames en el resultado de gql
5. Guardo en redis
 */
