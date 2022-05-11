function getRandomArbitrary(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
	listTypeInstances: (
		parent,
		args = {
			type: 'DummyType',
			limit: 5,
			offset: 0,
		}
	) => {
		const { type, limit = 5, offset = 0 } = args;

		return {
			items: Array(limit)
				.fill(null)
				.map((e, idx) => {
					const id = offset + idx + 1;
					const numDescriptions = getRandomArbitrary(0, 3);

					return {
						id,
						name: `Item ${id}`,
						description:
							numDescriptions === 0
								? undefined
								: Array(numDescriptions)
										.fill(
											'Velit tempor id qui ullamco officia. Cillum dolor dolor id minim reprehenderit reprehenderit laborum incididunt deserunt sunt. Veniam velit commodo aliqua ullamco veniam excepteur sint aliquip ea. Esse pariatur tempor adipisicing pariatur. Ullamco dolore et culpa voluptate esse dolor enim. Ullamco irure cupidatat pariatur pariatur consequat nisi amet. Do non ad commodo mollit voluptate et reprehenderit.'
										)
										.join(' '),
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
