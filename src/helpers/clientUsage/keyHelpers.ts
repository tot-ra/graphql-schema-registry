import { getTimestamp } from './redisHelpers';

export interface ParsedFieldKey {
	clientId: number;
	fieldKey: string;
	fieldId: number;
	parentTypeId: number;
	timestamp: number;
	type: 'error' | 'success';
}

export interface ParsedRootFieldKey {
	clientId: number;
	operationName: string;
	rootFieldKey: string;
	rootFieldId: number;
	timestamp: number;
	type: 'error' | 'success';
}

export function createFieldKey(
	type: 'error' | 'success',
	parentTypeId: number,
	fieldId: number,
	clientId: number
): string {
	// Field ids are prefixed with f letter to use globs efficiently in Redis scans.
	return `field_${parentTypeId}_${getTimestamp()}_f${fieldId}_${clientId}_${type}`;
}

export function createRootFieldKey(
	type: 'error' | 'success',
	rootFieldId: number,
	clientId: number,
	operationName: string
): string {
	return `root_field_${rootFieldId}_${getTimestamp()}_${clientId}_${operationName}_${type}`;
}

export function getFieldKeyGlob(
	parentTypeId: number,
	startTimestamp: number,
	endTimestamp: number,
	fieldId?: number
): string {
	const commonTimestampSubstring = getCommonSubstringFromStart(
		startTimestamp.toString(),
		endTimestamp.toString()
	);
	return fieldId !== undefined
		? `field_${parentTypeId}_${commonTimestampSubstring}*_f${fieldId}_*`
		: `field_${parentTypeId}_${commonTimestampSubstring}*`;
}

export function getRootFieldKeyGlob(
	rootFieldId: number,
	startTimestamp: number,
	endTimestamp: number
): string {
	const commonTimestampSubstring = getCommonSubstringFromStart(
		startTimestamp.toString(),
		endTimestamp.toString()
	);
	return `root_field_${rootFieldId}_${commonTimestampSubstring}*`;
}

export function parseFieldKey(fieldKey: string): ParsedFieldKey {
	const { groups } = fieldKey.match(
		/^field_(?<rawParentTypeId>\d+)_(?<rawTimestamp>\d+)_f(?<rawFieldId>\d+)_(?<rawClientId>\d+)_(?<type>error|success)$/
	);
	return {
		clientId: Number(groups.rawClientId),
		fieldKey,
		fieldId: Number(groups.rawFieldId),
		parentTypeId: Number(groups.rawParentTypeId),
		timestamp: Number(groups.rawTimestamp),
		type: groups.type as 'error' | 'success',
	};
}

export function parseRootFieldKey(rootFieldKey: string): ParsedRootFieldKey {
	const { groups } = rootFieldKey.match(
		/^root_field_(?<rawRootFieldId>\d+)_(?<rawTimestamp>\d+)_(?<rawClientId>\d+)_(?<operationName>.+)_(?<type>error|success)$/
	);
	return {
		clientId: Number(groups.rawClientId),
		operationName: groups.operationName,
		rootFieldKey,
		rootFieldId: Number(groups.rawRootFieldId),
		timestamp: Number(groups.rawTimestamp),
		type: groups.type as 'error' | 'success',
	};
}

function getCommonSubstringFromStart(a: string, b: string): string {
	let common = '';

	for (let i = 0; a[i] === b[i] && i < a.length; i += 1) {
		common = `${common}${a[i]}`;
	}
	return common;
}
