import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as useStatsBundle from '../../../shared/useStats';
import { InstancesListing } from '../InstancesListing';

const items: Parameters<typeof InstancesListing>[0]['items'] = Array(10)
	.fill(null)
	.map((_, index) => ({
		id: index,
		name: `name-${index}`,
		providedBy: [
			{
				name: `providedBy-${index}`,
			},
		],
		type: `type-${index}`,
		description: `description-${index}`,
	}));

describe('InstancesListing tests', () => {
	it('should render', async () => {
		const onPageChange = jest.fn();
		const onRowsPerPageChange = jest.fn();

		render(
			<InstancesListing
				typeName="typeName"
				pagination={{
					limit: 100,
					page: 1,
					total: 100,
					totalPages: 1000,
				}}
				items={items}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
			/>,
			{
				wrapper: MemoryRouter,
			}
		);

		const title = await screen.findByText('typeName');
		expect(title).toBeInTheDocument();

		const table = await screen.findByRole('table');
		expect(table).toBeInTheDocument();

		const rows = await within(table).findAllByRole('row');
		expect(rows.length).toBe(items.length + 2); // +1 header +1 footer

		const columns = await within(table).findAllByRole('columnheader');
		expect(columns.length).toBe(3);
	});

	it('should render an extra column when there are stats', async () => {
		const onPageChange = jest.fn();
		const onRowsPerPageChange = jest.fn();

		jest.spyOn(useStatsBundle, 'default').mockReturnValue([
			true,
			() => 'link',
		]);

		render(
			<InstancesListing
				typeName="typeName"
				pagination={{
					limit: 100,
					page: 1,
					total: 100,
					totalPages: 1000,
				}}
				items={items}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
			/>,
			{
				wrapper: MemoryRouter,
			}
		);

		const table = await screen.findByRole('table');
		expect(table).toBeInTheDocument();

		const columns = await within(table).findAllByRole('columnheader');
		expect(columns.length).toBe(4);
	});
});
