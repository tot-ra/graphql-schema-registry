import redisWrapper from '../../redis';
import {
	getFieldKeyGlob,
	getRootFieldKeyGlob,
	type ParsedFieldKey,
	type ParsedRootFieldKey,
	parseFieldKey,
	parseRootFieldKey,
} from './keyHelpers';

const REDIS_TIMEOUT_MS = 10000;

interface UsageCounter {
	usageCount: number;
}
export type ParsedFieldRedisEntry = ParsedFieldKey & UsageCounter;
export type ParsedRootFieldRedisEntry = ParsedRootFieldKey & UsageCounter;

export async function getAndParseFieldRedisEntries(
	parentTypeId: number,
	startDate: Date,
	endDate: Date,
	fieldId?: number
): Promise<ParsedFieldRedisEntry[]> {
	const startTimestamp = getTimestamp(startDate);
	const endTimestamp = getTimestamp(endDate);
	const fieldKeys = await redisWrapper.scan(
		getFieldKeyGlob(parentTypeId, startTimestamp, endTimestamp, fieldId),
		REDIS_TIMEOUT_MS
	);

	if (!fieldKeys) {
		return [];
	}

	const parsedFieldKeys = fieldKeys
		.map(parseFieldKey)
		.filter(
			({ timestamp }) =>
				timestamp >= startTimestamp && timestamp <= endTimestamp
		);

	if (parsedFieldKeys.length === 0) {
		return [];
	}

	const fieldValues = await redisWrapper.multiGet(
		parsedFieldKeys.map(({ fieldKey }) => fieldKey),
		REDIS_TIMEOUT_MS
	);

	return parsedFieldKeys.map((parsedFieldKey, index) => ({
		...parsedFieldKey,
		usageCount: Number(fieldValues[index]),
	}));
}

export async function getAndParseRootFieldRedisEntries(
	rootFieldId: number,
	startDate: Date,
	endDate: Date
): Promise<ParsedRootFieldRedisEntry[]> {
	const startTimestamp = getTimestamp(startDate);
	const endTimestamp = getTimestamp(endDate);
	const rootFieldKeys = await redisWrapper.scan(
		getRootFieldKeyGlob(rootFieldId, startTimestamp, endTimestamp),
		REDIS_TIMEOUT_MS
	);

	if (!rootFieldKeys) {
		return [];
	}

	const parsedRootFieldKeys = rootFieldKeys
		.map(parseRootFieldKey)
		.filter(
			({ timestamp }) =>
				timestamp >= startTimestamp && timestamp <= endTimestamp
		);

	if (parsedRootFieldKeys.length === 0) {
		return [];
	}

	const rootFieldValues = await redisWrapper.multiGet(
		parsedRootFieldKeys.map(({ rootFieldKey }) => rootFieldKey),
		REDIS_TIMEOUT_MS
	);

	return parsedRootFieldKeys.map((parsedRootFieldKey, index) => ({
		...parsedRootFieldKey,
		usageCount: Number(rootFieldValues[index]),
	}));
}

export async function getFieldUsageCount(
	parentTypeId: number,
	fieldId: number,
	startDate: Date,
	endDate: Date
): Promise<number> {
	return sumUsage(
		await getAndParseFieldRedisEntries(
			parentTypeId,
			startDate,
			endDate,
			fieldId
		)
	);
}

export async function getRootFieldUsageCount(
	rootFieldId: number,
	startDate: Date,
	endDate: Date
): Promise<number> {
	return sumUsage(
		await getAndParseRootFieldRedisEntries(rootFieldId, startDate, endDate)
	);
}

export function getTimestamp(date = new Date()): number {
	const dateClone = new Date(date);
	dateClone.setUTCHours(0);
	dateClone.setUTCMinutes(0);
	dateClone.setUTCSeconds(0);
	dateClone.setUTCMilliseconds(0);
	return Math.round(dateClone.getTime() / 1000);
}

export async function getTypeFieldsUsageCount(
	typeId: number,
	startDate: Date,
	endDate: Date
): Promise<number> {
	return sumUsage(
		await getAndParseFieldRedisEntries(typeId, startDate, endDate)
	);
}

function sumUsage(usageCounters: UsageCounter[]): number {
	return usageCounters.reduce((sum, { usageCount }) => sum + usageCount, 0);
}
