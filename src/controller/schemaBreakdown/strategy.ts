import { DocumentNode, parse } from 'graphql';
import { DocumentNodeType } from '../../model/enums';
import { ScalarStrategy } from './scalar';
import { Transaction } from 'knex';
import { EnumStrategy } from './enum';
import { InputStrategy } from './input';
import { DirectiveStrategy } from './directive';
import { InterfaceStrategy } from './interface';
import { ObjectStrategy } from './object';
import { UnionStrategy } from './union';
import { SubgraphTransactionalRepository } from '../../database/schemaBreakdown/subgraph';
import { SubgraphStrategy } from './subgraph';

type DocumentMap = Map<string, any[]>;

export interface TypeDefStrategy<T> {
	getEntities(data: ITypeDefData): T[];
	insertEntities(data: ITypeDefData, entities: T[]): Promise<void>;
}

export interface ITypeDefData {
	mappedTypes: DocumentMap;
	dbMap: Map<string, number>;
	subgraphTypes: number[];
	trx: Transaction;
	service_id: number;
}

export class BreakDownStrategy {
	private readonly mappedTypes: DocumentMap = new Map();
	private strategies: Map<string, TypeDefStrategy<any>> = new Map();

	constructor(
		private typeDef: string,
		private trx: Transaction,
		private service_id: number
	) {
		const schema = parse(typeDef);
		this.mappedTypes = this.mapTypes(schema);
	}

	public async execute() {
		const data = {
			mappedTypes: this.mappedTypes,
			dbMap: new Map<string, number>(),
			subgraphTypes: [],
			trx: this.trx,
			service_id: this.service_id,
		} as ITypeDefData;
		this.initializeStrategies();
		const strategies = this.getStrategies();
		const promises = strategies.map(async (strategy) => {
			const entities = strategy.getEntities(data);
			return await strategy.insertEntities(data, entities);
		});
		await Promise.all(promises);
		const strategy = new SubgraphStrategy();
		const subGraphs = strategy.getEntities(data);
		await strategy.insertEntities(data, subGraphs);
	}

	private mapTypes(document: DocumentNode): DocumentMap {
		return document.definitions.reduce((acc, cur) => {
			const type = cur.kind;
			if (acc.has(type)) {
				acc.set(type, [...acc.get(type), cur]);
			} else {
				acc.set(type, [cur]);
			}
			return acc;
		}, new Map<string, any[]>());
	}

	private initializeStrategies() {
		this.strategies.set(DocumentNodeType.SCALAR, new ScalarStrategy());
		this.strategies.set(DocumentNodeType.ENUM, new EnumStrategy());
		this.strategies.set(DocumentNodeType.INPUT, new InputStrategy());
		this.strategies.set(
			DocumentNodeType.DIRECTIVE,
			new DirectiveStrategy()
		);
		this.strategies.set(
			DocumentNodeType.INTERFACE,
			new InterfaceStrategy()
		);
		this.strategies.set(DocumentNodeType.OBJECT, new ObjectStrategy());
		this.strategies.set(DocumentNodeType.UNION, new UnionStrategy());
	}

	private getStrategies(): TypeDefStrategy<any>[] {
		const strategies: TypeDefStrategy<any>[] = [new ScalarStrategy()];
		this.strategies.forEach((value, key) => {
			if (key !== DocumentNodeType.SCALAR && this.mappedTypes.has(key)) {
				strategies.push(value);
			}
		});
		return strategies;
	}
}
