import { Change, ChangeType } from '@graphql-inspector/core';
import { FieldChangeStrategy } from './field';
import { Transaction } from 'knex';
import { TypeChangeStrategy } from './type';
import { ImplementationChangeStrategy } from './implementation';

export interface TypeDefChangeStrategy {
	apply(data: ITypeDefChangeStrategy): Promise<void>;
}

export interface ITypeDefChangeStrategy {
	changes: Change[];
	changesType: any;
	trx: Transaction;
}

const changesType = {
	field: [
		ChangeType.FieldRemoved,
		ChangeType.EnumValueRemoved,
		ChangeType.FieldArgumentRemoved,
		ChangeType.InputFieldRemoved,
	],
	type: [ChangeType.TypeRemoved, ChangeType.DirectiveRemoved],
	implementation: [ChangeType.ObjectTypeInterfaceRemoved],
};

export class SchemaChangeStrategy {
	private strategies: Map<string, TypeDefChangeStrategy> = new Map();
	constructor(private changes: Change[], private trx: Transaction) {}

	public async execute() {
		const data = {
			changes: this.changes,
			changesType,
			trx: this.trx,
		} as ITypeDefChangeStrategy;

		this.initializeStrategies();
		const strategies = this.getStrategies(this.changes);
		const promises = strategies.map(async (strategy) => {
			return strategy.apply(data);
		});
		await Promise.all(promises);
	}

	private initializeStrategies() {
		this.strategies.set('field', new FieldChangeStrategy());
		this.strategies.set('type', new TypeChangeStrategy());
		this.strategies.set(
			'implementation',
			new ImplementationChangeStrategy()
		);
	}

	private getStrategies(changes: Change[]): TypeDefChangeStrategy[] {
		const strategies: TypeDefChangeStrategy[] = [];
		this.strategies.forEach((value, key) => {
			if (changes.some((c) => changesType[key].includes(c.type))) {
				strategies.push(value);
			}
		});
		return strategies;
	}
}
