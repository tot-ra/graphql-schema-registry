import { Knex } from 'knex';

import { logger } from '../logger';
import { Change } from '@graphql-inspector/core';
import { BreakDownStrategy } from './schemaBreakdown/strategy';
import { SchemaChangeStrategy } from './schemaChanges/strategy';

interface BreakDownService {
	breakDown(): Promise<void>;
	applyChanges(changes: Change[]): void;
}

export class BreakDownSchemaCaseUse implements BreakDownService {
	constructor(
		private trx: Knex.Transaction,
		private type_defs: string,
		private service_id: number
	) {}

	async applyChanges(changes: Change[]) {
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
			throw err;
		}
	}
}
