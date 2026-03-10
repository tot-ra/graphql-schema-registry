import {
	parse,
	type DefinitionNode,
	type FieldDefinitionNode,
	type InputValueDefinitionNode,
	type TypeNode,
} from 'graphql';

type DiffKind =
	| 'INITIAL'
	| 'TYPE_ADDED'
	| 'TYPE_REMOVED'
	| 'TYPE_KIND_CHANGED'
	| 'FIELD_ADDED'
	| 'FIELD_REMOVED'
	| 'FIELD_TYPE_CHANGED'
	| 'ARG_ADDED'
	| 'ARG_REMOVED'
	| 'ARG_TYPE_CHANGED'
	| 'ENUM_VALUE_ADDED'
	| 'ENUM_VALUE_REMOVED'
	| 'UNION_MEMBER_ADDED'
	| 'UNION_MEMBER_REMOVED'
	| 'ERROR';

interface SchemaDiffRow {
	changeType: DiffKind;
	change: string;
}

interface ParsedType {
	kind: string;
	fields: Map<string, string>;
	argsByField: Map<string, Map<string, string>>;
	enumValues: Set<string>;
	unionMembers: Set<string>;
}

interface ParsedSchema {
	types: Map<string, ParsedType>;
}

function typeNodeToString(typeNode: TypeNode): string {
	switch (typeNode.kind) {
		case 'NamedType':
			return typeNode.name.value;
		case 'ListType':
			return `[${typeNodeToString(typeNode.type)}]`;
		case 'NonNullType':
			return `${typeNodeToString(typeNode.type)}!`;
		default:
			return '';
	}
}

function ensureType(parsedSchema: ParsedSchema, name: string, kind: string) {
	const existing = parsedSchema.types.get(name);

	if (existing) {
		return existing;
	}

	const created: ParsedType = {
		kind,
		fields: new Map(),
		argsByField: new Map(),
		enumValues: new Set(),
		unionMembers: new Set(),
	};
	parsedSchema.types.set(name, created);
	return created;
}

function addField(
	typeEntry: ParsedType,
	fieldNode: FieldDefinitionNode | InputValueDefinitionNode
) {
	typeEntry.fields.set(fieldNode.name.value, typeNodeToString(fieldNode.type));
}

function addFieldArguments(typeEntry: ParsedType, fieldNode: FieldDefinitionNode) {
	if (!fieldNode.arguments || !fieldNode.arguments.length) {
		return;
	}

	const args = new Map<string, string>();

	for (const argument of fieldNode.arguments) {
		args.set(argument.name.value, typeNodeToString(argument.type));
	}

	typeEntry.argsByField.set(fieldNode.name.value, args);
}

function parseSchema(typeDefs: string): ParsedSchema {
	const ast = parse(typeDefs);
	const parsedSchema: ParsedSchema = {
		types: new Map(),
	};

	for (const definition of ast.definitions) {
		consumeDefinition(parsedSchema, definition);
	}

	return parsedSchema;
}

function consumeDefinition(parsedSchema: ParsedSchema, definition: DefinitionNode) {
	switch (definition.kind) {
		case 'ObjectTypeDefinition':
		case 'ObjectTypeExtension': {
			const typeEntry = ensureType(
				parsedSchema,
				definition.name.value,
				'ObjectTypeDefinition'
			);

			for (const field of definition.fields || []) {
				addField(typeEntry, field);
				addFieldArguments(typeEntry, field);
			}
			break;
		}
		case 'InterfaceTypeDefinition':
		case 'InterfaceTypeExtension': {
			const typeEntry = ensureType(
				parsedSchema,
				definition.name.value,
				'InterfaceTypeDefinition'
			);

			for (const field of definition.fields || []) {
				addField(typeEntry, field);
				addFieldArguments(typeEntry, field);
			}
			break;
		}
		case 'InputObjectTypeDefinition':
		case 'InputObjectTypeExtension': {
			const typeEntry = ensureType(
				parsedSchema,
				definition.name.value,
				'InputObjectTypeDefinition'
			);

			for (const field of definition.fields || []) {
				addField(typeEntry, field);
			}
			break;
		}
		case 'EnumTypeDefinition':
		case 'EnumTypeExtension': {
			const typeEntry = ensureType(
				parsedSchema,
				definition.name.value,
				'EnumTypeDefinition'
			);

			for (const value of definition.values || []) {
				typeEntry.enumValues.add(value.name.value);
			}
			break;
		}
		case 'UnionTypeDefinition':
		case 'UnionTypeExtension': {
			const typeEntry = ensureType(
				parsedSchema,
				definition.name.value,
				'UnionTypeDefinition'
			);

			for (const member of definition.types || []) {
				typeEntry.unionMembers.add(member.name.value);
			}
			break;
		}
		case 'ScalarTypeDefinition':
		case 'ScalarTypeExtension': {
			ensureType(parsedSchema, definition.name.value, 'ScalarTypeDefinition');
			break;
		}
		default:
			break;
	}
}

function compareFieldArguments(
	typeName: string,
	fieldName: string,
	beforeArgs: Map<string, string> | undefined,
	afterArgs: Map<string, string> | undefined,
	rows: SchemaDiffRow[]
) {
	const beforeArgNames = new Set(beforeArgs ? Array.from(beforeArgs.keys()) : []);
	const afterArgNames = new Set(afterArgs ? Array.from(afterArgs.keys()) : []);
	const argNames = Array.from(new Set([...beforeArgNames, ...afterArgNames])).sort();

	for (const argName of argNames) {
		const hadArg = beforeArgs?.has(argName);
		const hasArg = afterArgs?.has(argName);

		if (!hadArg && hasArg) {
			rows.push({
				changeType: 'ARG_ADDED',
				change: `Argument ${typeName}.${fieldName}(${argName}) added`,
			});
			continue;
		}

		if (hadArg && !hasArg) {
			rows.push({
				changeType: 'ARG_REMOVED',
				change: `Argument ${typeName}.${fieldName}(${argName}) removed`,
			});
			continue;
		}

		const beforeType = beforeArgs?.get(argName);
		const afterType = afterArgs?.get(argName);

		if (beforeType && afterType && beforeType !== afterType) {
			rows.push({
				changeType: 'ARG_TYPE_CHANGED',
				change: `Argument ${typeName}.${fieldName}(${argName}) type changed from ${beforeType} to ${afterType}`,
			});
		}
	}
}

function compareFields(
	typeName: string,
	beforeType: ParsedType,
	afterType: ParsedType,
	rows: SchemaDiffRow[]
) {
	const beforeFieldNames = new Set(Array.from(beforeType.fields.keys()));
	const afterFieldNames = new Set(Array.from(afterType.fields.keys()));
	const fieldNames = Array.from(
		new Set([...beforeFieldNames, ...afterFieldNames])
	).sort();

	for (const fieldName of fieldNames) {
		const hadField = beforeType.fields.has(fieldName);
		const hasField = afterType.fields.has(fieldName);

		if (!hadField && hasField) {
			rows.push({
				changeType: 'FIELD_ADDED',
				change: `Field ${typeName}.${fieldName} added`,
			});
			continue;
		}

		if (hadField && !hasField) {
			rows.push({
				changeType: 'FIELD_REMOVED',
				change: `Field ${typeName}.${fieldName} removed`,
			});
			continue;
		}

		const beforeFieldType = beforeType.fields.get(fieldName);
		const afterFieldType = afterType.fields.get(fieldName);

		if (
			beforeFieldType &&
			afterFieldType &&
			beforeFieldType !== afterFieldType
		) {
			rows.push({
				changeType: 'FIELD_TYPE_CHANGED',
				change: `Field ${typeName}.${fieldName} type changed from ${beforeFieldType} to ${afterFieldType}`,
			});
		}

		compareFieldArguments(
			typeName,
			fieldName,
			beforeType.argsByField.get(fieldName),
			afterType.argsByField.get(fieldName),
			rows
		);
	}
}

function compareEnumValues(
	typeName: string,
	beforeType: ParsedType,
	afterType: ParsedType,
	rows: SchemaDiffRow[]
) {
	const beforeValues = new Set(Array.from(beforeType.enumValues));
	const afterValues = new Set(Array.from(afterType.enumValues));
	const values = Array.from(new Set([...beforeValues, ...afterValues])).sort();

	for (const value of values) {
		const hadValue = beforeType.enumValues.has(value);
		const hasValue = afterType.enumValues.has(value);

		if (!hadValue && hasValue) {
			rows.push({
				changeType: 'ENUM_VALUE_ADDED',
				change: `Enum value ${typeName}.${value} added`,
			});
			continue;
		}

		if (hadValue && !hasValue) {
			rows.push({
				changeType: 'ENUM_VALUE_REMOVED',
				change: `Enum value ${typeName}.${value} removed`,
			});
		}
	}
}

function compareUnionMembers(
	typeName: string,
	beforeType: ParsedType,
	afterType: ParsedType,
	rows: SchemaDiffRow[]
) {
	const beforeMembers = new Set(Array.from(beforeType.unionMembers));
	const afterMembers = new Set(Array.from(afterType.unionMembers));
	const members = Array.from(new Set([...beforeMembers, ...afterMembers])).sort();

	for (const member of members) {
		const hadMember = beforeType.unionMembers.has(member);
		const hasMember = afterType.unionMembers.has(member);

		if (!hadMember && hasMember) {
			rows.push({
				changeType: 'UNION_MEMBER_ADDED',
				change: `Union member ${member} added to ${typeName}`,
			});
			continue;
		}

		if (hadMember && !hasMember) {
			rows.push({
				changeType: 'UNION_MEMBER_REMOVED',
				change: `Union member ${member} removed from ${typeName}`,
			});
		}
	}
}

export function diffSchemaTypeDefs(
	previousTypeDefs: string | null,
	nextTypeDefs: string
): SchemaDiffRow[] {
	if (!previousTypeDefs) {
		return [
			{
				changeType: 'INITIAL',
				change: 'Initial schema registered',
			},
		];
	}

	try {
		const beforeSchema = parseSchema(previousTypeDefs);
		const afterSchema = parseSchema(nextTypeDefs);
		const rows: SchemaDiffRow[] = [];

		const beforeTypeNames = new Set(Array.from(beforeSchema.types.keys()));
		const afterTypeNames = new Set(Array.from(afterSchema.types.keys()));
		const typeNames = Array.from(
			new Set([...beforeTypeNames, ...afterTypeNames])
		).sort();

		for (const typeName of typeNames) {
			const beforeType = beforeSchema.types.get(typeName);
			const afterType = afterSchema.types.get(typeName);

			if (!beforeType && afterType) {
				rows.push({
					changeType: 'TYPE_ADDED',
					change: `Type ${typeName} added`,
				});
				continue;
			}

			if (beforeType && !afterType) {
				rows.push({
					changeType: 'TYPE_REMOVED',
					change: `Type ${typeName} removed`,
				});
				continue;
			}

			if (!beforeType || !afterType) {
				continue;
			}

			if (beforeType.kind !== afterType.kind) {
				rows.push({
					changeType: 'TYPE_KIND_CHANGED',
					change: `Type ${typeName} kind changed from ${beforeType.kind} to ${afterType.kind}`,
				});
			}

			if (
				afterType.kind === 'ObjectTypeDefinition' ||
				afterType.kind === 'InterfaceTypeDefinition' ||
				afterType.kind === 'InputObjectTypeDefinition'
			) {
				compareFields(typeName, beforeType, afterType, rows);
			}

			if (afterType.kind === 'EnumTypeDefinition') {
				compareEnumValues(typeName, beforeType, afterType, rows);
			}

			if (afterType.kind === 'UnionTypeDefinition') {
				compareUnionMembers(typeName, beforeType, afterType, rows);
			}
		}

		if (!rows.length) {
			return [];
		}

		return rows;
	} catch (error) {
		return [
			{
				changeType: 'ERROR',
				change: `Unable to diff schema versions: ${error instanceof Error ? error.message : String(error)}`,
			},
		];
	}
}
