import { useQuery } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { Logs } from '../Logs';
import { Log } from '../types';

jest.mock('@apollo/client');

describe('Logs component', () => {
	beforeEach(() => {
		(useQuery as jest.Mock).mockReturnValue({
			data: null,
			loading: false,
			error: null,
		});
	});
	it('should render not logs when logs are null', async () => {
		render(<Logs />);

		const text = await screen.findByText('No Logs yet');

		expect(text).toBeInTheDocument();
	});

	it('should render  logs when logs are available', async () => {
		(useQuery as jest.Mock).mockReturnValue({
			data: {
				logs: [
					{
						timestamp: new Date().getDate(),
						level: 'info',
						message: [
							{ message: 'test', extensions: { code: 500 } },
						],
					},
				] as Log[],
			},
			loading: false,
			error: null,
		});

		render(<Logs />);

		const text = await screen.findByText(/test/);

		expect(text).toBeInTheDocument();
	});
});
