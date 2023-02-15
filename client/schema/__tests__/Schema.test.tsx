import { useQuery } from '@apollo/client';
import { render, screen } from '@testing-library/react';

import { useSchema } from '../useSchema';
import { Order, SortField } from '../types';
import { Schema } from '../Schema';

jest.mock('@apollo/client');

jest.mock('../useSchema');

describe('Schema Component', () => {
	beforeEach(() => {
		(useQuery as jest.Mock).mockReturnValue({
			data: null,
			loading: true,
			error: null,
		});
		(useSchema as jest.MockedFunction<typeof useSchema>).mockReturnValue({
			setSort: jest.fn(),
			sort: {
				sortField: SortField.NAME,
				[SortField.NAME]: Order.DESC,
				[SortField.ADDEDD_TIME]: Order.DESC,
			},
			services: [
				{
					name: 'test',
					id: 1,
					addedTime: new Date(),
					isActive: true,
					updatedTime: new Date(),
					url: '',
				},
				{
					name: 'hello',
					id: 1,
					addedTime: new Date(),
					isActive: true,
					updatedTime: new Date(),
					url: '',
				},
			],
			loading: false,
		});
	});
	it('should render schema component when it has data', async () => {
		render(<Schema />);

		const buttons = await screen.findAllByRole('button');

		expect(buttons.length).toBe(4);
	});

	it('should not render schema component when it loading services', async () => {
		(useSchema as jest.MockedFunction<typeof useSchema>).mockReturnValue({
			setSort: jest.fn(),
			sort: {
				sortField: SortField.NAME,
				[SortField.NAME]: Order.DESC,
				[SortField.ADDEDD_TIME]: Order.DESC,
			},
			services: [],
			loading: true,
		});
		render(<Schema />);

		const buttons = screen.queryAllByRole('button');

		expect(buttons.length).toBe(0);
	});
});
