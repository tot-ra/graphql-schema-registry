import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EmptyList, NavigationList, NavigationListItem } from '../List';

describe('Lists tests', () => {
	describe('EmptyList tests', () => {
		it('should render', () => {
			render(<EmptyList />);
		});
	});

	describe('NavigationListItem tests', () => {
		it('should render', async () => {
			render(<NavigationListItem href="/test" value="Test" />, {
				wrapper: MemoryRouter,
			});

			const link = await screen.findByRole<HTMLAnchorElement>('link');

			expect(link).toBeInTheDocument();
			expect(link.href).toMatch(/.+\/test$/);
			expect(link.textContent).toBe('Test');
		});

		it('should render a chevron icon when the prop is active', async () => {
			render(
				<NavigationListItem
					href="/test"
					value="Test"
					showNavigationChevron
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			const link = await screen.findByRole<HTMLAnchorElement>('link');

			expect(link).toMatchSnapshot();
		});
	});

	describe('NavigationList tests', () => {
		it('should render', async () => {
			render(
				<NavigationList>
					<span>Dummy</span>
				</NavigationList>
			);

			const list = await screen.findByRole('navigation');

			expect(list).toBeInTheDocument();
		});
	});
});
