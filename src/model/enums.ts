export enum OperationType {
	QUERY = "Query",
	MUTATION = "Mutation"
}

export enum EntityType {
	OBJECT = "Object",
	SCALAR = "Scalar",
	INTERFACE = "Interface",
	ENUM = "Enum",
	INPUT = "Input",
	DIRECTIVE = "Directive"
}

export enum DocumentNodeType {
	SCALAR = "ScalarTypeDefinition",
	ENUM = "EnumTypeDefinition",
	OBJECT = "ObjectTypeDefinition",
	SCHEMA = "SchemaDefinition",
	DIRECTIVE = "DirectiveDefinition",
	UNION = "UnionTypeDefinition",
	FIELD = "FieldDefinition",
	INTERFACE = "InterfaceTypeDefinition"
}
