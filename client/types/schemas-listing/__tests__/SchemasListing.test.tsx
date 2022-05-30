import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TypeInstancesOutput } from '../../../utils/queries';
import { SchemasListing } from '../SchemasListing';

describe('SchemasListing tests', () => {
	it('should render', async () => {
		const schemas: TypeInstancesOutput['listTypeInstances']['items'][0]['providedBy'] =
			[
				{
					name: 'schema1',
				},
				{
					name: 'schema2',
				},
			];

		render(<SchemasListing schemas={schemas} />, {
			wrapper: MemoryRouter,
		});

		const nav = await screen.findByRole('navigation');
		expect(nav).toBeInTheDocument();

		const links = await screen.findAllByRole<HTMLAnchorElement>('link');
		expect(links.length).toBe(schemas.length);

		links.forEach((link, index) => {
			expect(link.textContent).toBe(schemas[index].name);
			expect(link.href).toMatch(
				new RegExp(`.+/schema/${schemas[index].name}`)
			);
		});
	});
});
