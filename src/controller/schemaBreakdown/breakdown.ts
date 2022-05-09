import {DocumentNode, parse} from "graphql";
import {DocumentNodeType, EntityType} from "../../model/enums";
import {Type, TypePayload} from "../../model/type";
import {TypeTransactionalRepository} from "../../database/schemaBreakdown/type";
import Knex from "knex";
import {Field, FieldPayload} from "../../model/field";
import {FieldTransactionRepository} from "../../database/schemaBreakdown/field";

type DocumentMap = Map<string, any[]>
type EnumPayload = {
	enum: TypePayload,
	values: string[]
}[];
type InterfacePayload = {
	interface: TypePayload,
	implementations: TypePayload[];
}

export class BreakDownSchemaCaseUse {
	private typeRepository;
	private fieldRepository;
	private dbMap: Map<string, number>; // Map -> name: id

	constructor(
		private trx: Knex.Transaction,
		private type_defs: string,
		private service_id: number
	) {
		this.typeRepository = new TypeTransactionalRepository(trx);
		this.fieldRepository = new FieldTransactionRepository(trx);
		this.dbMap = new Map<string, number>();
	}

	async breakDown(): Promise<void> {
		try {
			const schema = parse(this.type_defs);
			const mappedTypes = BreakDownSchemaCaseUse.mapTypes(schema);
			await this.computeScalars(mappedTypes);
			await this.computeEnums(mappedTypes);
			// const enums = getEnums(mappedTypes);
			// const directives = getDirectives(mappedTypes);
			// const interfaces = getInterfaces(mappedTypes);
			// const queries = getQueries(mappedTypes);
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

		const objectScalars = mappedTypes.get(DocumentNodeType.OBJECT)?.reduce((acc, cur) =>
		{
			const fieldTypes = cur.fields
				.map(field =>  BreakDownSchemaCaseUse.getScalarsFromFields(field))
				.filter(Boolean);
			//TODO: What we have to handle ID type
			return [...acc, ...fieldTypes];
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
		await this.typeRepository.insertIgnoreTypes(Array.from(types.values()));
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
					is_nullable: false,
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

	private getDirectives(mappedTypes: DocumentMap): string[] {
		return mappedTypes.get(DocumentNodeType.DIRECTIVE)?.map(directive => directive.name.value) ?? [];
	}

	private static getScalarsFromFields(field: any): TypePayload | null {
		//TODO: Watch out infinite loop
		while(field.type) {
			field = field.type;
		}
		const name = field.name.value;
		if (!["Int", "string", "Boolean", "ID"].includes(name)) {
			return null;
		}
		return {
			name,
			description: field.description,
			type: EntityType.SCALAR
		}

	}

	private getInterfaces(mappedTypes: DocumentMap): InterfacePayload[] {
		return mappedTypes.get(DocumentNodeType.INTERFACE)?.reduce((acc, cur) =>
		{
			acc.push({
				interfaceName: acc.name.value,
				implementations: cur.values.map(i => {
					return {
						name: i.name.value,
						description: i.name.description,
						type: EntityType.OBJECT
					}
				})
			});
			return acc;
		}, [] as InterfacePayload[]) ?? [];
	}

	private getQueries(mappedTypes: DocumentMap): any[] {
		return []
	}
}

// TODO: After splitting
// export async privateinsertBreakDown(): any
