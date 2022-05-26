import {Report} from "apollo-reporting-protobuf";
import {ClientUsageStrategy} from "../clientUsage";
import {Client} from "../../model/client";

export class RegisteredClientStrategy implements ClientUsageStrategy {
	constructor(
		private decodedReport: typeof Report,
		private client: Client
	) {}

	async execute() {
		return;
	}
}
