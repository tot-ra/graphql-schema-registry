import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CommonLink } from '../Link';

describe('Links tests', () => {
	describe('CommonLink tests', () => {
		it('should render', async () => {
			render(<CommonLink to="/test" />, { wrapper: MemoryRouter });
			const link = await screen.findByRole('link');

			expect(link).toBeInTheDocument();
		});
	});
});
