import { parse, visit, visitWithTypeInfo } from 'graphql';

export default async (query, typeInfo) => {
	const queryObject = parse(query);
	const visitedFields = [];

	visit(
		queryObject,
		visitWithTypeInfo(typeInfo, {
			enter(node) {
				if (node?.kind !== 'Field') {
					return;
				}

				const property = node?.name?.value;
				const entity = typeInfo.getParentType()?.name;

				if (entity && property) {
					visitedFields.push({
						entity,
						property,
					});
				}
			},
		})
	);

	return visitedFields;
};
