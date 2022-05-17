import {DocumentNode, parse} from "graphql";
import {DocumentNodeType, EntityType, FieldProperty, OperationType} from "../model/enums";
import {Type, TypePayload} from "../model/type";
import {TypeTransactionalRepository} from "../database/schemaBreakdown/type";
import Knex, { Transaction } from "knex";
import {FieldPayload} from "../model/field";
import {FieldTransactionRepository} from "../database/schemaBreakdown/field";
import {Implementation} from "../model/implementation";
import {ImplementationTransactionRepository} from "../database/schemaBreakdown/implementation";
import {Argument} from "../model/argument";
import {ArgumentTransactionRepository} from "../database/schemaBreakdown/argument";
import {OperationPayload} from "../model/operation";
import {OperationParam} from "../model/operation_param";
import {OperationTransactionalRepository} from "../database/schemaBreakdown/operations";
import {OperationParamsTransactionalRepository} from "../database/schemaBreakdown/operation_params";
import {SubgraphTransactionalRepository} from "../database/schemaBreakdown/subgraph";
import {Subgraph} from "../model/subgraph";
import * as logger from '../logger';
import {Change, ChangeType, CriticalityLevel} from "@graphql-inspector/core";
import {PublicError} from "../helpers/error";
import {BreakDownStrategy} from "./schemaBreakdown/strategy";

type DocumentMap = Map<string, any[]>
type EnumPayload = {
	enum: TypePayload,
	values: string[]
}[];

type InterfacePayload = {
	interface: TypePayload,
	fields: any[];
}
type ObjectPayload = {
	object: TypePayload;
	fields: any[];
}
type DirectivePayload = {
	directive: TypePayload;
	fields: any[];
}

const BASE_SCALARS = ["Int", "String", "Boolean", "Float", "ID"]

interface BreakDownService {
	breakDown(): Promise<void>;
	validateBreakDown(changes: Change[], forcePush: string): void;
	applyChanges(changes: Change[]): void
}

export class BreakDownSchemaCaseUse implements BreakDownService {
	private typeRepository;
	private fieldRepository;
	private implementationRepository;
	private argumentRepository;
	private operationRepository;
	private operationParamRepository;
	private subgraphRepository = SubgraphTransactionalRepository.getInstance();
	private dbMap: Map<string, number>; // Map -> name: id
	private subgraphTypes: number[] = [];

	constructor(
		private trx: Transaction,
		private type_defs: string,
		private service_id: number
	) {
		this.typeRepository = TypeTransactionalRepository.getInstance();
		this.fieldRepository = FieldTransactionRepository.getInstance();
		this.implementationRepository = ImplementationTransactionRepository.getInstance();
		this.argumentRepository = ArgumentTransactionRepository.getInstance();
		this.operationRepository = OperationTransactionalRepository.getInstance();
		this.operationParamRepository = OperationParamsTransactionalRepository.getInstance();
		this.dbMap = new Map<string, number>();
	}

	validateBreakDown(changes: Change[], forcePush?: string) {
		const breakingChange = changes?.some(change => change.criticality.level === CriticalityLevel.Breaking);
		if (breakingChange && forcePush?.toLowerCase() !== 'true') {
			const message = "Cannot push this schema because contains breaking changes. To force push it, you must add a header as (Force-Push: true)";
			logger.error(message);
			throw new PublicError(message, undefined);
		}
	}

	async applyChanges(changes: Change[]) {
		// const removalChanges = changes.filter(change => )
		const regexExpr = new RegExp("_REMOVED$");
		const removalChanges = changes.filter(change => regexExpr.test(change.type));

		await this.applyChangesToFields(removalChanges.filter(change => {
			const changeFields = [
				ChangeType.FieldRemoved,
				ChangeType.EnumValueRemoved
			]
			return changeFields.includes(change.type)
		}));
		await this.applyChangesToTypes(removalChanges.filter(change => {
			const changeTypes = [
				ChangeType.TypeRemoved,
				ChangeType.DirectiveRemoved,
			];
			return changeTypes.includes(change.type);
		}));
		await this.applyChangesToFieldArguments(removalChanges.filter(change => change.type === ChangeType.FieldArgumentRemoved));
		await this.applyChangesToImplementations(removalChanges.filter(change => change.type === ChangeType.ObjectTypeInterfaceRemoved))
	}

	private async applyChangesToFields(changes: Change[]) {
		const names = changes.map(change => change.path.split('.')[0]);
		if (names.length > 0) {
			await this.fieldRepository.removeFields(this.trx, names);
		}
	}

	private async applyChangesToTypes(changes: Change[]) {
		const names = changes.map(change => change.path.split('.')[0]);
		if (names.length > 0) {
			await this.typeRepository.removeTypes(this.trx, names);
		}
	}

	private async applyChangesToImplementations(changes: Change[]) {
		const implementationNames = changes.map(change => change.path.split('.')[0]);
		if (implementationNames.length > 0) {
			await this.implementationRepository.removeImplementations(this.trx, implementationNames)
		}
	}

	private async applyChangesToFieldArguments(changes: Change[]) {
		const names = changes.map(change => change.path.split('.')[0]);
		if (names.length > 0) {
			await this.argumentRepository.removeArguments(this.trx, names);
		}
	}

	async breakDown(): Promise<void> {
		try {
			const breakDown = new BreakDownStrategy(this.type_defs, this.trx, this.service_id);
			await breakDown.execute();
			return;
		} catch(err) {
			logger.error('Error breaking down the schema', err.message ?? err)
		}
	}
}
