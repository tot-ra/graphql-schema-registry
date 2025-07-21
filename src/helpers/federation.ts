import {
	DocumentNode,
	FieldNode,
	ObjectTypeDefinitionNode,
	parse,
	SelectionSetNode,
	visit,
} from 'graphql';
import { composeServices } from '@apollo/composition';

import { PublicError } from './error';
import { logger } from '../logger';
import { Change, ChangeType, CriticalityLevel } from '@graphql-inspector/core';

type ParsedSchema = {
	name: string;
	url: string;
	typeDefs: DocumentNode;
};

type Service = {
	name: string;
	url: string;
	type_defs: string;
};

const parseSchemas = (servicesSchemaMap: Service[]): ParsedSchema[] => {
	return servicesSchemaMap.map((schema) => {
		const typeDefs = parse(schema.type_defs);

		return {
			name: schema.name,
			url: schema.url,
			typeDefs,
		};
	});
};

export function composeAndValidateSchema(servicesSchemaMap) {
	let schema;
	let errors = [];

	try {
		const serviceList = parseSchemas(servicesSchemaMap);

		({ schema, errors } = composeServices(serviceList));
	} catch (error) {
		logger.error(error.message);

		errors = [error];
	}

	if (errors && errors.length) {
		const err = new PublicError('Schema validation failed', {
			details: errors,
		});
		logger.error(err);
		throw err;
	}

	return schema;
}

function checkAllKeys(servicesSchemaMap: Service[]) {
	const keyMap: TypeKeyMap = new Map();

	for (const service of servicesSchemaMap) {
		extractKeysFromSDL(parse(service.type_defs), service.name, keyMap);
	}

	return keyMap;
}

// This function checks the sanity of the keys in the servicesSchemaMap
// It ensures that the keys are consistent across all services
export function checkKeySanity(servicesSchemaMap, service: Service): Change[] {
	let schema;

	try {
		const keyMap: TypeKeyMap = new Map();
		const typeDefs = parse(service.type_defs);
		const extractedKeys = extractKeysFromSDL(
			typeDefs,
			service.name,
			keyMap
		);

		const allKeys = checkAllKeys(servicesSchemaMap);

		return checkServiceKeysWithinSupergraph(extractedKeys, allKeys);

		return schema;
	} catch (error) {
		logger.error(error.message);
		throw new PublicError('Checking for key sanity', {
			details: [error],
		});
	}
}

type KeyDirective = {
	fields: string;
	serviceName: string;
};

type TypeKeyMap = Map<string, KeyDirective[]>;

/**
 * Extract key directives from a single subgraph SDL string.
 */
function extractKeysFromSDL(
	document: DocumentNode,
	serviceName: string,
	keyMap: TypeKeyMap = new Map()
): TypeKeyMap {
	const ast: DocumentNode = document;

	visit(ast, {
		ObjectTypeDefinition(node: ObjectTypeDefinitionNode) {
			if (!node.directives) return;

			const keyDirectives = node.directives.filter(
				(d) => d.name.value === 'key'
			);

			for (const key of keyDirectives) {
				const fieldsArg = key.arguments?.find(
					(arg) => arg.name.value === 'fields'
				);
				const fieldsValue =
					fieldsArg?.value?.kind === 'StringValue'
						? fieldsArg.value.value
						: '';

				const normalizedFieldsValue = normalizeKeyFields(fieldsValue);

				if (!keyMap.has(node.name.value)) {
					keyMap.set(node.name.value, []);
				}

				keyMap.get(node.name.value)?.push({
					fields: normalizedFieldsValue,
					serviceName,
				});
			}
		},
	});

	return keyMap;
}

function normalizeKeyFields(fields: string): string {
	const fragmentSDL = `fragment Dummy on DummyType { ${fields} }`;
	const document = parse(fragmentSDL);

	const selectionSet =
		document.definitions[0].kind === 'FragmentDefinition'
			? document.definitions[0].selectionSet
			: null;

	if (!selectionSet) {
		throw new Error('Could not parse key fields.');
	}

	const normalizeSelectionSet = (set: SelectionSetNode): string => {
		const selections = set.selections
			.filter((s): s is FieldNode => s.kind === 'Field')
			.sort((a, b) => a.name.value.localeCompare(b.name.value));

		return selections
			.map((field) => {
				if (field.selectionSet) {
					return `${field.name.value} { ${normalizeSelectionSet(
						field.selectionSet
					)} }`;
				}
				return field.name.value;
			})
			.join(' ');
	};

	return normalizeSelectionSet(selectionSet);
}

function checkServiceKeysWithinSupergraph(
	serviceKeys: TypeKeyMap,
	supergraphKeys: TypeKeyMap
): Change[] {
	const changes: Change[] = [];
	for (const [typeName, keys] of serviceKeys.entries()) {
		const supergraphTypeKeys = supergraphKeys.get(typeName);
		for (const key of keys) {
			if (
				supergraphTypeKeys &&
				!supergraphTypeKeys.some((k) => k.fields === key.fields)
			) {
				changes.push({
					type: ChangeType.DirectiveArgumentAdded,
					path: typeName,
					message: `Key ${key.fields} for type ${typeName} in service ${key.serviceName} not found in supergraph keys.`,
					criticality: {
						level: CriticalityLevel.Breaking,
						reason: 'Key not found in supergraph. Please check owner graph to sync keys declaration',
					},
					meta: {
						availableKeys: supergraphTypeKeys
							? [
									...new Set(
										supergraphTypeKeys.map((k) => k.fields)
									),
							  ]
							: [],
					},
				});
			}
		}
	}
	return changes;
}

export function getSuperGraph(servicesSchemaMap): string {
	const serviceList = parseSchemas(servicesSchemaMap);

	const { supergraphSdl } = composeServices(serviceList);

	return supergraphSdl;
}
