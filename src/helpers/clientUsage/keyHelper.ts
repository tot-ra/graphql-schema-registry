import { getTimestamp } from '../../redis/utils';

export function createRootFieldKey(
	type: 'error' | 'success',
	rootFieldId: number,
	clientId: number,
	operationName: string
): string {
	return `root_field_${rootFieldId}_${getTimestamp()}_${clientId}_${operationName}_${type}`;
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

export function parseRootFieldKey(key: string): {
	clientId: number;
	operationName: string;
	rootFieldId: number;
	timestamp: number;
	type: 'error' | 'success';
} {
	const { groups } = key.match(
		/^root_field_(?<rawRootFieldId>\d+)_(?<rawTimestamp>\d+)_(?<rawClientId>\d+)_(?<operationName>.+)_(?<type>error|success)$/
	);
	return {
		clientId: Number(groups.rawClientId),
		operationName: groups.operationName,
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
