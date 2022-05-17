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
	private subgraphRepository;
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
		this.subgraphRepository = SubgraphTransactionalRepository.getInstance();
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
			// const schema = parse(this.type_defs);
			// const mappedTypes = BreakDownSchemaCaseUse.mapTypes(schema);
			// await this.computeScalars(mappedTypes);
			// await this.computeEnums(mappedTypes);
			// await this.computeInputs(mappedTypes);
			// await this.computeDirectives(mappedTypes);
			// await this.computeInterfaces(mappedTypes);
			// await this.computeObjects(mappedTypes);
			// await this.computeUnions(mappedTypes);
			// await this.computeImplementations(mappedTypes);
			// await this.computeQueries(mappedTypes, OperationType.QUERY);
			// await this.computeQueries(mappedTypes, OperationType.MUTATION);
			// await this.registerSubgraph();
			return;
		} catch(err) {
			logger.error('Error breaking down the schema', err.message ?? err)
		}
	}

	private static mapTypes(document: DocumentNode): DocumentMap {
		return document.definitions.reduce((acc, cur) => {
			const type = cur.kind;
			if (acc.has(type)) {
				acc.set(type, [...acc.get(type), cur])
			} else {
				acc.set(type, [cur])
			}
			return acc;
		}, new Map<string, any[]>())
	}

	private async computeScalars(mappedTypes: DocumentMap) {
		const scalars = this.getScalars(mappedTypes);
		await this.computeTypes(scalars)
	}

	private getScalars(mappedTypes: DocumentMap): Map<string, TypePayload> {
		const scalars = mappedTypes
			.get(DocumentNodeType.SCALAR)?.map((def: any) => {
				return {
					name: def.name.value,
					description: def.description?.value ?? def.description,
					type: EntityType.SCALAR
				}
			}) ?? [];

		const objects = mappedTypes.get(DocumentNodeType.OBJECT) ?? [];
		const inputs = mappedTypes.get(DocumentNodeType.INPUT) ?? [];
		const directives = mappedTypes.get(DocumentNodeType.DIRECTIVE) ?? [];
		const objectScalars = [...objects, ...inputs, ...directives].reduce((acc, cur) =>
		{
			const potentialScalars = [...cur?.fields ?? [], ...cur?.arguments ?? []];
			const fieldTypes = potentialScalars
				.map(field =>  BreakDownSchemaCaseUse.getScalarsFromFields(field))
				.filter(Boolean);

			const fieldTypesFromArguments = potentialScalars
				.filter(field => field.arguments !== undefined && field.arguments.length > 0)
				.map(field => {
					return field.arguments.map(arg => BreakDownSchemaCaseUse.getScalarsFromFields(arg))
						.flat(1)
						.filter(Boolean)
				})
				.flat(1)

			return [...acc, ...fieldTypes, ...fieldTypesFromArguments];
		}, [] as string[]) ?? [];

		if (mappedTypes.get(DocumentNodeType.ENUM)?.length > 0) {
			scalars.push({
				name: 'String',
				description: undefined,
				type: EntityType.SCALAR
			})
		}
		return [...scalars, ...objectScalars].reduce((acc, cur) => {
			const name = cur.name;
			if (!acc.has(name)) {
				acc.set(name, cur);
			}
			return acc;
		}, new Map<string, TypePayload>())
	}

	private async computeTypes(types: Map<string, TypePayload>) {
		if (types === undefined || types.size === 0) {
			return
		}
		await this.typeRepository.insertIgnoreTypes(this.trx, Array.from(types.values()));
		const names = Array.from(types.keys());
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(this.trx, names)
		dbTypes.forEach(t => {
			this.dbMap.set(t.name, t.id);
			this.subgraphTypes.push(t.id);
		})
	}

	private async computeEnums(mappedTypes: DocumentMap) {
		const enums = this.getEnums(mappedTypes);
		const enumsDb = enums.reduce((acc, cur) => {
			// TODO: Extract on a helping function
			const name = cur.enum.name;
			if (!acc.has(name)) {
				acc.set(name, cur.enum);
			}
			return acc;
		}, new Map<string, TypePayload>())
		await this.computeTypes(enumsDb);
		const stringTypeId = this.dbMap.get('String');
		const fields = enums.map(e => {
			const parentId = this.dbMap.get(e.enum.name);
			return e.values.map(f => {
				return {
					name: f,
					description: undefined,
					is_nullable: true,
					is_array:false,
					is_array_nullable: false,
					is_deprecated: false,
					parent_type_id: parentId,
					children_type_id: stringTypeId
				} as FieldPayload
			})
		});
		const promises = fields.map(field => this.fieldRepository.insertIgnoreFields(this.trx, field));
		await Promise.all(promises);
	}

	private getEnums(mappedTypes: DocumentMap): EnumPayload {
		return mappedTypes.get(DocumentNodeType.ENUM)?.reduce((acc, cur) =>
		{
			acc.push({
				enum: {
					name: cur.name.value,
					description: cur.name.description?.value ?? cur.name.description,
					type: EntityType.ENUM
				},
				values: cur.values.map(e => e.name.value)
			})
			return acc;
		}, [] as EnumPayload) ?? [];
	}

	private async computeInputs(mappedTypes: DocumentMap) {
		const inputs = this.getInputs(mappedTypes);
		if (inputs.length > 0) {
			await this.typeRepository.insertIgnoreTypes(this.trx, inputs.map(i => i.object));
			const dbInputs = await this.typeRepository.getTypesByNames(this.trx, inputs.map(i => i.object.name));
			dbInputs.forEach(i => {
				this.dbMap.set(i.name, i.id);
				this.subgraphTypes.push(i.id);
			});
		}
		await this.computeObjectProperties(inputs)
	}

	private getInputs(mappedTypes: DocumentMap): ObjectPayload[] {
		return mappedTypes.get(DocumentNodeType.INPUT)?.reduce((acc, cur) => {
			const obj = {
				object: {
					name: cur.name.value,
					description: cur.description?.value ?? cur.description,
					type: EntityType.INPUT
				},
				fields: cur.fields
			} as ObjectPayload;
			acc.push(obj)
			return acc;
		}, [] as ObjectPayload[]) ?? []
	}

	private async computeDirectives(mappedTypes: DocumentMap) {
		const directives = this.getDirectives(mappedTypes);
		if (directives.length > 0) {
			const names = directives.map(d => d.directive.name);
			await this.typeRepository.insertIgnoreTypes(this.trx, directives.map(d => d.directive));
			const dbDirectives = await this.typeRepository.getTypesByNames(this.trx, names);
			dbDirectives.forEach(d => {
				this.dbMap.set(d.name, d.id);
				this.subgraphTypes.push(d.id);
			});
			const fields = directives.map(d => {
				return d.fields.map(field => this.extractFieldFromObject(field, d.directive.name))
			}).flat(1);
			this.fieldRepository.insertIgnoreFields(this.trx, fields);
		}
	}

	private getDirectives(mappedTypes: DocumentMap): DirectivePayload[] {
		return mappedTypes.get(DocumentNodeType.DIRECTIVE)?.reduce((acc, curr) => {
			const directive = {
				directive: {
					name: curr.name.value,
					description: curr.description?.value ?? curr.description,
					type: EntityType.DIRECTIVE
				},
				fields: curr.arguments
			} as DirectivePayload
			acc.push(directive);
			return acc;
		}, [] as DirectivePayload[]) ?? [];
	}

	private static getScalarsFromFields(field: any): TypePayload | null {
		while(field.type) {
			field = field.type;
		}
		const name = field.name.value;
		if (!BASE_SCALARS.includes(name)) {
			return null;
		}
		return {
			name,
			description: field.description?.value ?? field.description,
			type: EntityType.SCALAR
		}

	}

	private static getExistingObjectsFromObjects(field: any): string {
		while(field.type) {
			field = field.type;
		}
		const name = field.name.value;
		if (BASE_SCALARS.includes(name)) {
			return null;
		}
		return name;

	}

	private async computeInterfaces(mappedTypes: DocumentMap) {
		const interfaces = this.getInterfaces(mappedTypes);
		if (interfaces.length > 0) {
			await this.typeRepository.insertIgnoreTypes(this.trx, interfaces.map(i => i.interface));
			const names = interfaces.map(i => i.interface.name);
			const dbInterfaces = await this.typeRepository.getTypesByNames(this.trx, names);
			dbInterfaces.forEach(t => {
				this.dbMap.set(t.name, t.id);
				this.subgraphTypes.push(t.id);
			});
			const fields = interfaces.map(i => {
				return i.fields.map(field => this.extractFieldFromObject(field, i.interface.name));
			}).flat(1);
			if (fields.length > 0) {
				this.fieldRepository.insertIgnoreFields(this.trx, fields);
			}
		}
	}

	private getInterfaces(mappedTypes: DocumentMap): InterfacePayload[] {
		return mappedTypes.get(DocumentNodeType.INTERFACE)?.reduce((acc, cur) =>
		{
			const int = {
				interface: {
					name: cur.name.value,
					description: cur.description?.value ?? cur.description,
					type: EntityType.INTERFACE
				},
				fields: cur.fields,
			} as InterfacePayload;
			return [...acc, ...[int]]
		}, [] as InterfacePayload[]) ?? [];
	}

	private async computeObjects(mappedTypes: DocumentMap) {
		const objects = this.getObjectsToInsert(mappedTypes);
		if (objects.length > 0) {
			await this.typeRepository.insertIgnoreTypes(this.trx, objects.map(obj => obj.object));
			const existingObjects = this.getExistingObjects(mappedTypes);
			const names = objects.map(obj => obj.object.name);
			const dbObjects = await this.typeRepository.getTypesByNames(this.trx, [...names, ...existingObjects]);
			dbObjects.forEach(obj => {
				this.dbMap.set(obj.name, obj.id);
				this.subgraphTypes.push(obj.id)
			});
		}
		await this.computeObjectProperties(objects);
	}

	private async computeUnions(mappedTypes: DocumentMap) {
		const unions = this.getUnions(mappedTypes);
		if (unions && unions.size > 0) {
			await this.typeRepository.insertIgnoreTypes(this.trx, Array.from(unions.values()));
			const dbUnions = await this.typeRepository.getTypesByNames(this.trx, Array.from(unions.keys()));
			dbUnions.forEach(u => {
				this.dbMap.set(u.name, u.id);
				this.subgraphTypes.push(u.id);
			});
		}
	}

	private getUnions(mappedTypes: DocumentMap): Map<string, TypePayload> {
		return mappedTypes.get(DocumentNodeType.UNION)?.reduce((acc, cur) => {
			const name = cur.name.value;
			if (!acc.has(name)) {
				acc.set(name, {
					name,
					description: cur.description?.value ?? cur.description,
					type: EntityType.OBJECT
				});
			}
			return acc;
		}, new Map<string, TypePayload>());
	}

	private async computeImplementations(mappedTypes: DocumentMap) {
		const dbImplementations = mappedTypes.get(DocumentNodeType.OBJECT)?.filter(o => {
			return o.interfaces?.length > 0;
		}).map(imp => {
			const implementationId = this.dbMap.get(imp.name.value);
			const implementations = imp.interfaces.map(int => this.dbMap.get(int.name.value))
			return implementations.map(i => {
				return {
					interface_id: i,
					implementation_id: implementationId
				} as Implementation
			})
		}).flat(1)
		if (dbImplementations.length > 0) {
			await this.implementationRepository.insertIgnoreImplementations(this.trx, dbImplementations);
		}
	}

	private async computeObjectProperties(objects: ObjectPayload[]) {
		const fields = objects.map(obj => {
			return obj.fields.map(field => this.extractFieldFromObject(field, obj.object.name))
		}).flat(1)
		if (fields.length > 0) {
			await this.fieldRepository.insertIgnoreFields(this.trx, fields);
		}

		const argumentsMap = new Map<string, string>()
		const fieldsWithArguments = objects.map(obj => {
			const fields = obj.fields.filter(field => field.arguments !== undefined && field.arguments.length > 0);
			fields.forEach(f => argumentsMap.set(f.name.value, obj.object.name));
			return fields;
		}).flat(1)
		if (fieldsWithArguments.length > 0) {
			const names = fieldsWithArguments.map(fwa => fwa.name.value);
			const dbFields = await this.fieldRepository.getFieldsByNames(this.trx, names);
			dbFields.forEach(field => this.dbMap.set(field.name, field.id));
			const fieldArguments = fieldsWithArguments.map(fwa => {
				return fwa.arguments.map(arg => this.extractFieldFromObject(arg, argumentsMap.get(fwa.name.value)))
			}).flat(1)
			await this.fieldRepository.insertIgnoreFields(this.trx, fieldArguments)
			const dbFieldArguments = await this.fieldRepository.getFieldsByNames(this.trx, fieldArguments.map(f => f.name));
			dbFieldArguments.forEach(f => this.dbMap.set(f.name, f.id));
			const argumentsToInsert = fieldsWithArguments.map(f => {
				return f.arguments.map(arg => {
					return {
						argument_id: this.dbMap.get(arg.name.value),
						field_id: this.dbMap.get(f.name.value)
					} as Argument
				})
			}).flat(1);
			if (argumentsToInsert.length > 0) {
				await this.argumentRepository.insertIgnoreArguments(this.trx, argumentsToInsert);
			}
		}
	}

	private getObjectsToInsert(mappedTypes: DocumentMap): ObjectPayload[] {
		return mappedTypes.get(DocumentNodeType.OBJECT)?.filter(obj => !['Query', 'Mutation'].includes(obj.name.value))
			.reduce((acc, cur) => {
				const obj = {
					object: {
						name: cur.name.value,
						description: cur.description?.value ?? cur.description,
						type: EntityType.OBJECT
					},
					fields: cur.fields
				} as ObjectPayload;
				acc.push(obj)
				return acc;
			}, [] as ObjectPayload[])
	}

	private getExistingObjects(mappedTypes: DocumentMap): string[] {
		const objects = mappedTypes.get(DocumentNodeType.OBJECT)?.reduce((acc, cur) => {
			const objectTypes = cur.fields
				.map(field =>  BreakDownSchemaCaseUse.getExistingObjectsFromObjects(field))
				.filter(Boolean);
			return [...acc, ...objectTypes]
		}, [] as string[])

		return objects.filter((obj, index, self) => {
			return index === self.indexOf(obj)
		})
	}

	private async computeQueries(mappedTypes: DocumentMap, type: OperationType) {
		const queries = this.getOperations(mappedTypes, type);
		const operations = queries.map(query => {
			return query.fields.map(q => {
				return {
					name: q.name.value,
					description: q.description?.value ?? q.description,
					type,
					service_id: this.service_id
				} as OperationPayload;
			})
		}).flat(1)
		if (operations.length > 0) {
			await this.operationRepository.insertIgnoreOperations(this.trx, operations);
			const dbOperations = await this.operationRepository.getOperationsByNames(this.trx, operations.map(o => o.name));
			dbOperations.forEach(o => this.dbMap.set(o.name, o.id));
		}
		const result = queries.reduce((acc, cur) => {
			cur.fields.forEach(query => {
				const args = query.arguments.map(arg => this.extractOperation(arg, query.name.value, false));
				acc.input = acc.input.concat(args);
				const output = this.extractOperation(query, query.name.value, true)
				acc.output = acc.output.concat(output);
			});
			return acc;
		}, {
			input: [],
			output: []
		} as {
			input: any[],
			output: any[],
			query: any[]
		})
		const operationParams = [...result.input, ...result.output];
		if (operationParams.length > 0) {
			await this.operationParamRepository.insertIgnoreOperationParams(this.trx, operationParams);
		}
	}


	private getOperations(mappedTypes: DocumentMap, type: OperationType): any[] {
		return mappedTypes.get(DocumentNodeType.OBJECT)?.filter(obj => obj.name.value.toLowerCase() === type.toLowerCase())
			.reduce((acc, cur) => {
				const obj = {
					object: {
						name: cur.name.value,
						description: cur.description?.value ?? cur.description,
						type: EntityType.OBJECT
					},
					fields: cur.fields
				} as ObjectPayload;
				acc.push(obj)
				return acc;
			}, [] as ObjectPayload[])
	}

	private extractOperation(field: any, parentName: string, is_output: boolean): OperationParam {
		let name = '';
		if (!is_output) {
			name = field.name.value
		}
		let is_array = false;
		let is_nullable = true
		let is_array_nullable = true;
		const description = field.description?.value ?? field.description;
		while (field.type) {
			const nextType = field.type;
			const fieldType = field.kind;
			if ((fieldType === DocumentNodeType.FIELD || fieldType === DocumentNodeType.INPUT_VALUE)
				&& nextType?.kind === FieldProperty.NOT_NULL) {
				is_nullable = false;
			}
			if (fieldType === FieldProperty.IS_ARRAY) {
				is_array = true;
				if (nextType?.kind === FieldProperty.NOT_NULL) {
					is_array_nullable = false;
				}
			}
			field = nextType;
		}
		if (is_output) {
			name = field.name.value;
		}

		return {
			name,
			description,
			is_array,
			is_array_nullable,
			is_nullable,
			is_output,
			operation_id: this.dbMap.get(parentName),
			type_id: this.dbMap.get(field.name.value)
		} as OperationParam
	}

	private extractFieldFromObject(field: any, parentName: string): FieldPayload {
		let name = field.name.value;
		let is_array = false;
		let is_nullable = true
		let is_array_nullable = true;
		const is_deprecated = field.directives?.filter(d => d.name.value.toLowerCase() === "deprecated").length > 0;
		const description = field.description?.value ?? field.description;
		while (field.type) {
			const nextType = field.type;
			const fieldType = field.kind;
			if ((fieldType === DocumentNodeType.FIELD || fieldType === DocumentNodeType.INPUT_VALUE)
				&& nextType?.kind === FieldProperty.NOT_NULL) {
				is_nullable = false;
			}
			if (fieldType === FieldProperty.IS_ARRAY) {
				is_array = true;
				if (nextType?.kind === FieldProperty.NOT_NULL) {
					is_array_nullable = false;
				}
			}
			field = nextType;
		}

		return {
			name,
			description,
			is_array,
			is_array_nullable,
			is_nullable,
			is_deprecated,
			parent_type_id: this.dbMap.get(parentName),
			children_type_id: this.dbMap.get(field.name.value)
		}
	}

	private async registerSubgraph() {
		if (this.subgraphTypes.length === 0) {
			return
		}
		await this.subgraphRepository.insertIgnoreSubGraphs(this.trx, this.subgraphTypes.map(s => {
			return {
				service_id: this.service_id,
				type_id: s
			} as Subgraph
		}))
	}
}
