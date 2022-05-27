import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorRetry } from '../ErrorRetry';

describe('ErrorRetry tests', () => {
	it('should render with the default props', async () => {
		render(<ErrorRetry />);

		const element = await screen.findByText('Something wrong happened :(');

		expect(element).toBeInTheDocument();
	});

	it('should render a custom label', async () => {
		const MockedComponent = jest.fn().mockImplementation(() => 'Mocked');

		render(
			<ErrorRetry>
				<MockedComponent />
			</ErrorRetry>
		);

		expect(MockedComponent).toHaveBeenCalledTimes(1);
	});

	it('should render a retry button when providing a callback', async () => {
		const handleOnRetry = jest.fn();

		render(<ErrorRetry onRetry={handleOnRetry} />);

		const button = await screen.findByRole('button');

		expect(button).toBeInTheDocument();
	});

	it('should call the callback when the user clicks the button', async () => {
		const handleOnRetry = jest.fn();

		render(<ErrorRetry onRetry={handleOnRetry} />);

		const button = await screen.findByRole('button');
		await userEvent.click(button);

		expect(handleOnRetry).toHaveBeenCalledTimes(1);
	});
});
