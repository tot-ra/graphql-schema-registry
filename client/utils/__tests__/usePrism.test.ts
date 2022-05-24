import { renderHook } from '@testing-library/react-hooks';
import usePrism from '../usePrism';

describe('tests for usePrism', () => {
	it('should return null when no code is provided', () => {
		const { result } = renderHook(() => usePrism());

		expect(result.current).toBeNull();
	});

	it('should return a JSX element when code is provided', () => {
		const { result } = renderHook(() => usePrism('test code'));

		expect(result.current).not.toBeNull();
		expect(result.current).toMatchSnapshot();
	});
});
