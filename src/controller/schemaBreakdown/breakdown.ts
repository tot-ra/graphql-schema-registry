import {DocumentNode, parse} from "graphql";
import {DocumentNodeType, EntityType} from "../../model/enums";
import {TypePayload} from "../../model/type";
import {TypeTransactionalRepository} from "../../database/schemaBreakdown/type";
import Knex from "knex";
import {Deck} from "@material-ui/icons";

type DocumentMap = Map<string, any[]>
type EnumPayload = {
	enum: TypePayload,
	values: String[]
}[];
type InterfacePayload = {
	interface: TypePayload,
	implementations: TypePayload[];
}

export class BreakDownSchemaCaseUse {
	private typeRepository;

	constructor(
		private trx: Knex.Transaction,
		private type_defs: string,
		private service_id: number
	) {
		this.typeRepository = new TypeTransactionalRepository(trx);
	}

	async breakDown(): Promise<void> {
		try {
			const schema = parse(this.type_defs);
			const mappedTypes = BreakDownSchemaCaseUse.mapTypes(schema);
			await this.computeScalars(mappedTypes);
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
		const names = Array.from(scalars.keys());

		const types = await this.typeRepository.getTypesByNames(names);
		const notInDBTypes = names.filter(item => types.map(t => t.name).indexOf(item) < 0);

		if (notInDBTypes.length > 0) {
			await this.typeRepository.insertTypes(notInDBTypes.map(name => scalars.get(name)));
		}
		return;
	}

	private getScalars(mappedTypes: DocumentMap): Map<String, TypePayload> {
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
		}, [] as String[]) ?? [];

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
		}, new Map<String, TypePayload>())
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

	private getDirectives(mappedTypes: DocumentMap): String[] {
		return mappedTypes.get(DocumentNodeType.DIRECTIVE)?.map(directive => directive.name.value) ?? [];
	}

	private static getScalarsFromFields(field: any): TypePayload | null {
		while(field.type) {
			field = field.type;
		}
		const name = field.name.value;
		if (!["Int", "String", "Boolean"].includes(name)) {
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
