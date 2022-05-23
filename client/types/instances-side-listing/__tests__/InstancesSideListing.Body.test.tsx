import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TypeSideInstancesOutput } from '../../../utils/queries';
import { InstancesSideListingBody } from '../InstancesSideListing.Body';

describe('InstancesSideListingBody tests', () => {
	it('should render', async () => {
		const items: TypeSideInstancesOutput['listTypeInstances']['items'] = [
			{
				id: 1,
				name: 'name-1',
			},
			{
				id: 2,
				name: 'name-2',
			},
		];

		render(
			<InstancesSideListingBody
				instanceId="12"
				items={items}
				typeName="dummy"
			/>,
			{
				wrapper: MemoryRouter,
			}
		);

		const nav = await screen.findByRole('navigation');
		expect(nav).toBeInTheDocument();

		const links = await screen.findAllByRole<HTMLAnchorElement>('link');
		expect(links.length).toBe(items.length);

		links.forEach((link, index) => {
			expect(link.textContent).toBe(items[index].name);
			expect(link.href).toMatch(
				new RegExp(`.+/types/dummy/${items[index].id}$`)
			);
		});
	});
});
