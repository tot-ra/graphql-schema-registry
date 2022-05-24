import { render } from '@testing-library/react';
import Logo from '../logo';

describe('tests for Logo', () => {
	it('should render and match snapshot', () => {
		const { container } = render(<Logo />);

		expect(container).toMatchSnapshot();
	});
});
