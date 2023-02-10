import { UsageStats } from './usage_counter';

export type FieldsUsageStats = {
	fieldId: number;
	clients: {
		clientName: string;
		clientVersions: {
			clientVersion: string;
			usageStats: UsageStats;
		}[];
	}[];
}[];

export type RootFieldUsageStats = {
	clientName: string;
	clientVersions: {
		clientVersion: string;
		usageStatsByOperationName: {
			operationName: string;
			usageStats: UsageStats;
		}[];
	}[];
}[];
