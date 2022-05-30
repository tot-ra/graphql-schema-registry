import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useHistory, useLocation } from 'react-router-dom';
import { InstancesSideListingHeader } from '../InstancesSideListing.Header';

let mockGoBack: jest.MockedFunction<ReturnType<typeof useHistory>['goBack']>;

jest.mock('react-router-dom', () => {
	const actual = jest.requireActual('react-router-dom');
	return {
		...actual,
		useLocation: jest.fn(),
		useHistory: () => ({
			goBack: mockGoBack,
		}),
	};
});

describe('InstanceSideListingHeader tests', () => {
	it('should render', async () => {
		(
			useLocation as jest.MockedFunction<typeof useLocation>
		).mockReturnValue({
			state: false,
			hash: 'dummy',
			pathname: '',
			search: '',
		});
		mockGoBack = jest.fn();

		render(<InstancesSideListingHeader counting={12} typeName="dummy" />, {
			wrapper: MemoryRouter,
		});

		const link = await screen.findByRole<HTMLAnchorElement>('link');

		expect(link).toBeInTheDocument();
		expect(link.textContent).toBe('dummy');
		expect(link.href).toMatch(/.+\/types\/dummy$/);

		const label = await screen.findByText('12');
		expect(label).toBeInTheDocument();
	});

	it('should go back instead of navigate when the entry is in the history', async () => {
		(
			useLocation as jest.MockedFunction<typeof useLocation>
		).mockReturnValue({
			state: true,
			hash: 'dummy',
			pathname: '',
			search: '',
		});
		mockGoBack = jest.fn();

		render(<InstancesSideListingHeader counting={12} typeName="dummy" />, {
			wrapper: MemoryRouter,
		});

		const link = await screen.findByRole<HTMLAnchorElement>('link');

		await userEvent.click(link);

		expect(mockGoBack).toHaveBeenCalledTimes(1);
	});

	it('should navigate when the entry is not in the history', async () => {
		(
			useLocation as jest.MockedFunction<typeof useLocation>
		).mockReturnValue({
			state: false,
			hash: 'dummy',
			pathname: '',
			search: '',
		});
		mockGoBack = jest.fn();

		render(<InstancesSideListingHeader counting={12} typeName="dummy" />, {
			wrapper: MemoryRouter,
		});

		const link = await screen.findByRole<HTMLAnchorElement>('link');

		await userEvent.click(link);

		expect(mockGoBack).not.toHaveBeenCalled();
	});
});
