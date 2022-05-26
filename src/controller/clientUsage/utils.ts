export function extractDefinitionData(definition: any): any {
	return definition.definitions
		?.map((def) => {
			return def.selectionSet.selections
				.map((op) => {
					return {
						operationName: op.name.value,
						fields: op.selectionSet.selections.map(
							(field) => field.name.value
						),
					};
				})
				.flat(1);
		})
		.flat(1);
}
