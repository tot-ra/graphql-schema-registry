import { render, screen } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import Main, { tabs } from '../Main';

jest.mock('../TopMenu', () => ({
	__esModule: true,
	default: () => 'TopMenu',
}));

jest.mock('../../schema', () => ({
	__esModule: true,
	default: () => 'Schema',
}));

jest.mock('../../types', () => ({
	__esModule: true,
	default: () => 'Types',
}));

jest.mock('../../persisted-queries', () => ({
	__esModule: true,
	default: () => 'PersistedQueries',
	Tab: () => 'Tab',
}));

const customRender = (
	ui: React.ReactElement,
	customProps: Partial<MemoryRouterProps>
) => {
	return render(ui, {
		wrapper: (props: MemoryRouterProps) => (
			<MemoryRouter {...props} {...customProps} />
		),
	});
};

describe('Main tests', () => {
	it('should render for Schema', async () => {
		customRender(<Main />, {
			initialEntries: [tabs[0].href],
			initialIndex: 0,
		});
		const main = await screen.findByRole('main');

		expect(main).toBeInTheDocument();
		expect(main).toMatchSnapshot();
	});

	it('should render for Types', async () => {
		customRender(<Main />, {
			initialEntries: [tabs[1].href],
			initialIndex: 1,
		});

		const main = await screen.findByRole('main');

		expect(main).toBeInTheDocument();
		expect(main).toMatchSnapshot();
	});

	it('should render for PersistedQueries', async () => {
		customRender(<Main />, {
			initialEntries: [tabs[2].href],
			initialIndex: 2,
		});

		const main = await screen.findByRole('main');

		expect(main).toBeInTheDocument();
		expect(main).toMatchSnapshot();
	});
});
