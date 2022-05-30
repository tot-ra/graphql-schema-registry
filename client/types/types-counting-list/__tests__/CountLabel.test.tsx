import { render, screen } from '@testing-library/react';
import CountLabel from '../CountLabel';

describe('CountLabel tests', () => {
	it('should render the text and the count', async () => {
		render(<CountLabel count={5} text="Text" />);

		const count = await screen.findByText('5');
		expect(count).toBeInTheDocument();

		const text = await screen.findByText('Text');
		expect(text).toBeInTheDocument();
	});
});
