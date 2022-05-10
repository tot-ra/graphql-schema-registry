import {DocumentNode, parse} from "graphql";
import {DocumentNodeType, EntityType, FieldProperty, OperationType} from "../../model/enums";
import {Type, TypePayload} from "../../model/type";
import {TypeTransactionalRepository} from "../../database/schemaBreakdown/type";
import Knex from "knex";
import {FieldPayload} from "../../model/field";
import {FieldTransactionRepository} from "../../database/schemaBreakdown/field";
import {Implementation} from "../../model/implementation";
import {ImplementationTransactionRepository} from "../../database/schemaBreakdown/implementation";
import {Argument} from "../../model/argument";
import {ArgumentTransactionRepository} from "../../database/schemaBreakdown/argument";
import {OperationPayload} from "../../model/operation";
import {OperationParam} from "../../model/operation_param";
import {OperationTransactionalRepository} from "../../database/schemaBreakdown/operations";
import {OperationParamsTransactionalRepository} from "../../database/schemaBreakdown/operation_params";

type DocumentMap = Map<string, any[]>
type EnumPayload = {
	enum: TypePayload,
	values: string[]
}[];
type InterfacePayload = {
	interface: TypePayload,
	implementations: TypePayload[];
}
type ObjectPayload = {
	object: TypePayload;
	fields: any[];
}
const BASE_SCALARS = ["Int", "String", "Boolean", "Float", "ID"]

export class BreakDownSchemaCaseUse {
	private typeRepository;
	private fieldRepository;
	private implementationRepository;
	private argumentRepository;
	private operationRepository;
	private operationParamRepository;
	private dbMap: Map<string, number>; // Map -> name: id

	constructor(
		private trx: Knex.Transaction,
		private type_defs: string,
		private service_id: number
	) {
		this.typeRepository = new TypeTransactionalRepository(trx);
		this.fieldRepository = new FieldTransactionRepository(trx);
		this.implementationRepository = new ImplementationTransactionRepository(trx);
		this.argumentRepository = new ArgumentTransactionRepository(trx);
		this.operationRepository = new OperationTransactionalRepository(trx);
		this.operationParamRepository = new OperationParamsTransactionalRepository(trx)
		this.dbMap = new Map<string, number>();
	}

	async breakDown(): Promise<void> {
		try {
			const schema = parse(this.type_defs);
			const mappedTypes = BreakDownSchemaCaseUse.mapTypes(schema);
			await this.computeScalars(mappedTypes);
			await this.computeEnums(mappedTypes);
			await this.computeInputs(mappedTypes);
			await this.computeDirectives(mappedTypes);
			await this.computeInterfaces(mappedTypes);
			await this.computeObjects(mappedTypes);
			await this.computeUnions(mappedTypes);
			await this.computeQueries(mappedTypes, OperationType.QUERY);
			await this.computeQueries(mappedTypes, OperationType.MUTATION);
			return;
		} catch(err) {
			console.log('Error breaking down the schema', err)
			// TODO: Check error management
			throw Error()
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
					description: def.description,
					type: EntityType.SCALAR
				}
			}) ?? [];

		const objects = mappedTypes.get(DocumentNodeType.OBJECT) ?? [];
		const inputs = mappedTypes.get(DocumentNodeType.INPUT) ?? [];
		const objectScalars = [...objects, ...inputs].reduce((acc, cur) =>
		{
			const fieldTypes = cur.fields
				.map(field =>  BreakDownSchemaCaseUse.getScalarsFromFields(field))
				.filter(Boolean);

			const fieldTypesFromArguments = cur.fields
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
		if (types && types.size > 0) {
			await this.typeRepository.insertIgnoreTypes(Array.from(types.values()));
		}
		const names = Array.from(types.keys());
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(names)
		dbTypes.forEach(t => this.dbMap.set(t.name, t.id))
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
					is_nullable: true,
					is_array:false,
					is_array_nullable: false,
					is_deprecated: false,
					parent_type_id: parentId,
					children_type_id: stringTypeId
				} as FieldPayload
			})
		});
		const promises = fields.map(field => this.fieldRepository.insertIgnoreFields(field));
		await Promise.all(promises);
	}

	private getEnums(mappedTypes: DocumentMap): EnumPayload {
		return mappedTypes.get(DocumentNodeType.ENUM)?.reduce((acc, cur) =>
		{
			acc.push({
				enum: {
					name: cur.name.value,
					description: cur.name.description,
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
			await this.typeRepository.insertIgnoreTypes(inputs.map(i => i.object));
			const dbInputs = await this.typeRepository.getTypesByNames(inputs.map(i => i.object.name));
			dbInputs.forEach(i => this.dbMap.set(i.name, i.id));
		}
		await this.computeObjectProperties(inputs)
	}

	private getInputs(mappedTypes: DocumentMap): ObjectPayload[] {
		return mappedTypes.get(DocumentNodeType.INPUT)?.reduce((acc, cur) => {
			const obj = {
				object: {
					name: cur.name.value,
					description: cur.description,
					type: EntityType.INPUT
				},
				fields: cur.fields
			} as ObjectPayload;
			acc.push(obj)
			return acc;
		}, [] as ObjectPayload[])
	}

	private async computeDirectives(mappedTypes: DocumentMap) {
		const directives = this.getDirectives(mappedTypes);
		if (directives && directives.size > 0) {
			await this.typeRepository.insertIgnoreTypes(Array.from(directives.values()));
		}
	}

	private getDirectives(mappedTypes: DocumentMap): Map<string, TypePayload> {
		return mappedTypes.get(DocumentNodeType.DIRECTIVE)?.reduce((acc, curr) => {
			const name = curr.name.value;
			if (!acc.has(name)) {
				acc.set(name, {
					name,
					description: curr.description,
					type: EntityType.DIRECTIVE
				});
			}
			return acc;
		}, new Map<string, TypePayload>());
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
			description: field.description,
			type: EntityType.SCALAR
		}

	}

	private static getExistingObjectsFromObjects(field: any): string {
		//TODO: Watch out infinite loop
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
		const allTypes = interfaces.map(i => {
			return [...[i.interface], ...i.implementations]
		});
		const interfacesToInsert = [].concat(...allTypes) as TypePayload[];
		if (interfacesToInsert.length > 0) {
			await this.typeRepository.insertIgnoreTypes(interfacesToInsert);
		}
		const names = interfacesToInsert.map(i => i.name);
		const dbInterfaces = await this.typeRepository.getTypesByNames(names);
		dbInterfaces.forEach(t => this.dbMap.set(t.name, t.id));
		const implementations = interfaces.map(i => {
			return i.implementations.map(imp => {
				return {
					interface_id: this.dbMap.get(i.interface.name),
					implementation_id: this.dbMap.get(imp.name)
				} as Implementation
			});
		});
		const dbImplementations = [].concat(...implementations)
		if (dbImplementations.length > 0) {
			await this.implementationRepository.insertIgnoreImplementations(dbImplementations);
		}
	}

	private getInterfaces(mappedTypes: DocumentMap): InterfacePayload[] {
		return mappedTypes.get(DocumentNodeType.INTERFACE)?.reduce((acc, cur) =>
		{
			const int = {
				interface: {
					name: cur.name.value,
					description: cur.description,
					type: EntityType.INTERFACE
				},
				implementations: cur.values?.map(i => {
					return {
						name: i.name.value,
						description: i.name.description,
						type: EntityType.OBJECT
					}
				}) ?? []
			} as InterfacePayload;
			return [...acc, ...[int]]
		}, [] as InterfacePayload[]) ?? [];
	}

	private async computeObjects(mappedTypes: DocumentMap) {
		const objects = this.getObjectsToInsert(mappedTypes);
		if (objects.length > 0) {
			await this.typeRepository.insertIgnoreTypes(objects.map(obj => obj.object));
		}
		const existingObjects = this.getExistingObjects(mappedTypes);
		const names = objects.map(obj => obj.object.name);
		const dbObjects = await this.typeRepository.getTypesByNames([...names, ...existingObjects]);
		dbObjects.forEach(obj => this.dbMap.set(obj.name, obj.id));
		await this.computeObjectProperties(objects);
	}

	private async computeUnions(mappedTypes: DocumentMap) {
		const unions = this.getUnions(mappedTypes);
		if (unions && unions.size > 0) {
			await this.typeRepository.insertIgnoreTypes(Array.from(unions.values()));
			const dbUnions = await this.typeRepository.getTypesByNames(Array.from(unions.keys()));
			dbUnions.forEach(u => this.dbMap.set(u.name, u.id));
		}
	}

	private getUnions(mappedTypes: DocumentMap): Map<string, TypePayload> {
		return mappedTypes.get(DocumentNodeType.UNION)?.reduce((acc, cur) => {
			const name = cur.name.value;
			if (!acc.has(name)) {
				acc.set(name, {
					name,
					description: cur.description,
					type: EntityType.OBJECT
				});
			}
			return acc;
		}, new Map<string, TypePayload>());
	}

	private async computeObjectProperties(objects: ObjectPayload[]) {
		const fields = objects.map(obj => {
			return obj.fields.map(field => this.extractFieldFromObject(field, obj.object.name))
		}).flat(1)
		if (fields.length > 0) {
			await this.fieldRepository.insertIgnoreFields(fields);
		}

		const argumentsMap = new Map<string, string>()
		const fieldsWithArguments = objects.map(obj => {
			const fields = obj.fields.filter(field => field.arguments !== undefined && field.arguments.length > 0);
			fields.forEach(f => argumentsMap.set(f.name.value, obj.object.name));
			return fields;
		}).flat(1)
		if (fieldsWithArguments.length > 0) {
			const names = fieldsWithArguments.map(fwa => fwa.name.value);
			const dbFields = await this.fieldRepository.getFieldsByNames(names);
			dbFields.forEach(field => this.dbMap.set(field.name, field.id));
			const fieldArguments = fieldsWithArguments.map(fwa => {
				return fwa.arguments.map(arg => this.extractFieldFromObject(arg, argumentsMap.get(fwa.name.value)))
			}).flat(1)
			await this.fieldRepository.insertIgnoreFields(fieldArguments)
			const dbFieldArguments = await this.fieldRepository.getFieldsByNames(fieldArguments.map(f => f.name));
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
				await this.argumentRepository.insertIgnoreArguments(argumentsToInsert);
			}
		}
	}

	private getObjectsToInsert(mappedTypes: DocumentMap): ObjectPayload[] {
		return mappedTypes.get(DocumentNodeType.OBJECT)?.filter(obj => !['Query', 'Mutation'].includes(obj.name.value))
			.reduce((acc, cur) => {
				const obj = {
					object: {
						name: cur.name.value,
						description: cur.description,
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
					description: q.description,
					type,
					service_id: this.service_id
				} as OperationPayload;
			})
		}).flat(1)
		if (operations.length > 0) {
			await this.operationRepository.insertIgnoreOperations(operations);
			const dbOperations = await this.operationRepository.getOperationsByNames(operations.map(o => o.name));
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
			await this.operationParamRepository.insertIgnoreOperationParams(operationParams);
		}
	}


	private getOperations(mappedTypes: DocumentMap, type: OperationType): any[] {
		return mappedTypes.get(DocumentNodeType.OBJECT)?.filter(obj => obj.name.value.toLowerCase() === type.toLowerCase())
			.reduce((acc, cur) => {
				const obj = {
					object: {
						name: cur.name.value,
						description: cur.description,
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
		let is_array = false;
		let is_nullable = true
		let is_array_nullable = true;
		while (field.type) {
			if (field.kind === DocumentNodeType.NAMED) {
				name = field.name.value;
			}
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
		if (field.kind === DocumentNodeType.NAMED) {
			name = field.name.value;
		}

		return {
			name,
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
			is_array,
			is_array_nullable,
			is_nullable,
			is_deprecated: false, // TODO: Check
			parent_type_id: this.dbMap.get(parentName),
			children_type_id: this.dbMap.get(field.name.value)
		}
	}
}
