const { Report } = require("apollo-reporting-protobuf");

export class NotRegisteredClientStrategy {
	constructor(private decodedReport: typeof Report) {}

	async execute() {
		const operations = Object.keys(this.decodedReport.tracesPerQuery).reduce((acc, cur) => {
			const operationName = cur.match(/# (\w+)/)[1];
			const query = cur.replace(/# \w+/, '').trim();
			const fieldNames = [];
			acc.push({operationName, query, fieldNames})
			return acc;
		}, [] as {
			operationName: string,
			fieldNames: string[],
			query: string
		}[])
	}
}
