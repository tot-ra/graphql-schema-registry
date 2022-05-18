import { Transaction } from 'knex';

import * as logger from '../logger';
import { Change, CriticalityLevel } from '@graphql-inspector/core';
import { PublicError } from '../helpers/error';
import { BreakDownStrategy } from './schemaBreakdown/strategy';
import { SchemaChangeStrategy } from './schemaChanges/strategy';

interface BreakDownService {
	breakDown(): Promise<void>;
	validateBreakDown(changes: Change[], forcePush: string): void;
	applyChanges(changes: Change[]): void;
}

export class BreakDownSchemaCaseUse implements BreakDownService {
	constructor(
		private trx: Transaction,
		private type_defs: string,
		private service_id: number
	) {}

	validateBreakDown(changes: Change[], forcePush?: string) {
		const breakingChange = changes?.some(
			(change) => change.criticality.level === CriticalityLevel.Breaking
		);
		if (breakingChange && forcePush?.toLowerCase() !== 'true') {
			const message =
				'Cannot push this schema because contains breaking changes. To force push it, you must add a header as (Force-Push: true)';
			logger.error(message);
			throw new PublicError(message, undefined);
		}
	}

	async applyChanges(changes: Change[]) {
		// const removalChanges = changes.filter(change => )
		const regexExpr = new RegExp('_REMOVED$');
		const removalChanges = changes.filter((change) =>
			regexExpr.test(change.type)
		);

		const schemaChanges = new SchemaChangeStrategy(
			removalChanges,
			this.trx
		);
		await schemaChanges.execute();
	}

	async breakDown(): Promise<void> {
		try {
			const breakDown = new BreakDownStrategy(
				this.type_defs,
				this.trx,
				this.service_id
			);
			await breakDown.execute();
			return;
		} catch (err) {
			logger.error('Error breaking down the schema', err.message ?? err);
		}
	}
}
