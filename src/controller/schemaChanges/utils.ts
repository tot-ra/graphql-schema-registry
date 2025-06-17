import { ChangeType, Change } from '@graphql-inspector/core';

export const getChanges = (
	changeTypes: typeof ChangeType[],
	changes: Change[]
): Change[] => {
	return changes.filter((c) => changeTypes.includes(c.type));
};
