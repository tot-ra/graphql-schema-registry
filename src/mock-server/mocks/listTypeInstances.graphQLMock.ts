export default {
	listTypeInstances: (
		parent,
		args = {
			type: 'DummyType',
			limit: 5,
			offset: 0,
		},
		context,
		info
	) => {
		const { type, limit, offset } = args;

		return {
			items: Array(limit)
				.fill(null)
				.map((e, idx) => {
					const id = offset + idx + 1;
					return {
						id,
						name: `Item ${id}`,
						description: `Description ${id}.`,
						type,
						providedBy: [{ name: `Provider ${id}` }],
					};
				}),
			pagination: {
				page: offset / limit,
				totalPages: 1000,
				limit,
			},
		};
	},
};
