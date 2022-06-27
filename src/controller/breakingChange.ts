import { Change, ChangeType, CriticalityLevel } from '@graphql-inspector/core';
import { getBreakingChangesTypes } from './breakingChanges/utils';

export type CustomChange = Change & {
	isBreakingChange: boolean;
	totalUsages: number;
};

export interface BreakingChangeService {
	validate(change: Change): boolean;
	validateUsage(
		change: Change,
		usage_days: number,
		min_usages: number
	): Promise<CustomChange>;
}

export class BreakingChangeHandler {
	constructor(
		private service: {
			name: string;
			version: string;
			type_defs: string;
		},
		private diff: Change[],
		private limits: {
			usage_days?: number;
			min_usages?: number;
		}
	) {}

	async handle(): Promise<CustomChange[]> {
		const breakingChanges = this.getBreakingChanges();
		const notBreakingChanges = this.getNotBreakingChanges();
		if (breakingChanges.length === 0) {
			return notBreakingChanges;
		}

		const enrichedBreakingChanges =
			await this.validateBreakingChangesUsages(breakingChanges);
		return [...enrichedBreakingChanges, ...notBreakingChanges];
	}

	private getBreakingChanges(): Change[] {
		return this.diff.filter(
			(change) => change.criticality.level === CriticalityLevel.Breaking
		);
	}

	private getNotBreakingChanges(): CustomChange[] {
		const changes = this.diff.filter(
			(change) => change.criticality.level !== CriticalityLevel.Breaking
		);

		return changes.map((change) => {
			return {
				...change,
				isBreakingChange: false,
				totalUsages: 0,
			};
		});
	}

	private async validateBreakingChangesUsages(
		changes: Change[]
	): Promise<CustomChange[]> {
		const breakingChanges = getBreakingChangesTypes();
		const result = changes
			.map((change) => {
				const strategies = breakingChanges.filter((bc) =>
					bc.validate(change)
				);

				if (strategies.length === 0) {
					return {
						...change,
						isBreakingChange: false,
						totalUsages: 0,
					} as CustomChange;
				}

				return strategies[0].validateUsage(
					change,
					this.limits.usage_days,
					this.limits.min_usages
				);
			})
			.flat(1);
		return await Promise.all(result);
	}
}
