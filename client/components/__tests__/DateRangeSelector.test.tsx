import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as CustomDateRangeSelectorDialogBundle from '../CustomDateRangeSelectorDialog';
import DateRangeSelector, { OPTIONS } from '../DateRangeSelector';

jest.mock('../CustomDateRangeSelectorDialog', () => ({
	__esModule: true,
	default: () => 'CustomDateRangeSelectorDialog',
}));

describe('DateRangeSelector tests', () => {
	it('should render the button', async () => {
		render(<DateRangeSelector />);

		const button = await screen.findByRole('button');

		expect(button).toBeInTheDocument();
	});

	describe('when the user clicks the button', () => {
		it('should open the menu', async () => {
			render(<DateRangeSelector />);

			const button = await screen.findByRole('button');
			await userEvent.click(button);

			const menu = await screen.findByRole('menubar');
			expect(menu).toBeInTheDocument();
		});

		it('should close the menu if it was previously open', async () => {
			render(<DateRangeSelector />);

			const button = await screen.findByRole('button');
			await userEvent.click(button);

			const menu = await screen.findByRole('menubar');
			expect(menu).toBeInTheDocument();

			await userEvent.click(button);
			expect(menu).not.toBeInTheDocument();

			expect(button).toHaveFocus();
		});
	});

	describe('when the selection date menu is open', () => {
		test.each(Object.values(OPTIONS))(
			'should render the option %o',
			async ({ label }) => {
				render(<DateRangeSelector />);

				const button = await screen.findByRole('button');
				await userEvent.click(button);

				const menu = await screen.findByRole('menubar');
				const option = await within(menu).findByText(label);
				expect(option).toBeInTheDocument();
			}
		);

		test.each(Object.values(OPTIONS))(
			'the button label should reflect the current selected option %o',
			async ({ label, range }) => {
				const mockedCustomDialog = jest.spyOn(
					CustomDateRangeSelectorDialogBundle,
					'default'
				);

				render(<DateRangeSelector />);

				const button = await screen.findByRole('button');
				await userEvent.click(button);

				const menu = await screen.findByRole('menubar');
				const option = await within(menu).findByText(label);
				await userEvent.click(option);

				expect(button.textContent).toBe(label);

				if (range === 'custom') {
					expect(mockedCustomDialog).toHaveBeenCalled();
				}
			}
		);
	});
});
