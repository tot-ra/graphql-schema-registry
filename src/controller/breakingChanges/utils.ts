import { Change } from '@graphql-inspector/core';
import { CustomChange } from '../breakingChange';

export function addUsageToChange(
	change: Change,
	totalUsages: number,
	minUsages: number
): CustomChange {
	return {
		...change,
		isBreakingChange: totalUsages > 0 && totalUsages >= minUsages,
		totalUsages,
	};
}

export function getDateRangeLimits(rangeDurationInDays: number): {
	endDate: Date;
	startDate: Date;
} {
	const now = new Date();
	const startDate = new Date(
		new Date().setDate(now.getDate() - rangeDurationInDays)
	);
	return { endDate: now, startDate };
}
