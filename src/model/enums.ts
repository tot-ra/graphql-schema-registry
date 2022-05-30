export enum OperationType {
	QUERY = 'query',
	MUTATION = 'mutation',
	SUBSCRIPTION = 'subscription',
}

export enum EntityType {
	OBJECT = 'object',
	SCALAR = 'scalar',
	INTERFACE = 'interface',
	ENUM = 'enum',
	INPUT = 'input',
	DIRECTIVE = 'directive',
}

export enum DocumentNodeType {
	SCALAR = 'ScalarTypeDefinition',
	ENUM = 'EnumTypeDefinition',
	OBJECT = 'ObjectTypeDefinition',
	SCHEMA = 'SchemaDefinition',
	DIRECTIVE = 'DirectiveDefinition',
	UNION = 'UnionTypeDefinition',
	FIELD = 'FieldDefinition',
	INTERFACE = 'InterfaceTypeDefinition',
	INPUT_VALUE = 'InputValueDefinition',
	INPUT = 'InputObjectTypeDefinition',
	NAMED = 'NamedType',
}

export enum FieldProperty {
	NOT_NULL = 'NonNullType',
	IS_ARRAY = 'ListType',
}
