import { Change, CriticalityLevel } from '@graphql-inspector/core';
import { FieldChange } from './breakingChanges/field';
import { TypeChange } from './breakingChanges/type';
import { EnumChange } from './breakingChanges/enum';
import { ArgumentChange } from './breakingChanges/argument';
import { InterfaceChange } from './breakingChanges/interface';

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
		breakingChanges: Change[]
	): Promise<CustomChange[]> {
		const breakingChangeServices: BreakingChangeService[] = [
			new FieldChange(),
			new TypeChange(),
			new EnumChange(),
			new ArgumentChange(),
			new InterfaceChange(),
		];

		return Promise.all(
			breakingChanges.map(async (breakingChange) => {
				const breakingChangeService = breakingChangeServices.find(
					(service) => service.validate(breakingChange)
				);

				if (breakingChangeService === undefined) {
					return {
						...breakingChange,
						isBreakingChange: false,
						totalUsages: 0,
					};
				}

				return breakingChangeService.validateUsage(
					breakingChange,
					this.limits.usage_days,
					this.limits.min_usages
				);
			})
		);
	}
}
