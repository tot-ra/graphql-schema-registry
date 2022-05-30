import { act, renderHook } from '@testing-library/react-hooks';
import useMinimumTime from '../useMinimumTime';

describe('useMinimumTime tests', () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	describe('when loading is false', () => {
		it('should return false', async () => {
			const { result } = renderHook(() => useMinimumTime(false));

			expect(result.current).toBeFalsy();
		});
	});

	describe('when loading is true', () => {
		it("should return true when timeout is not fired and loading doesn't change", () => {
			jest.useFakeTimers();

			const { result } = renderHook(() => useMinimumTime(true));

			expect(result.current).toBeTruthy();
		});

		it("should return true when timeout fires and loading doesn't change", () => {
			jest.useFakeTimers();

			const { result } = renderHook(() =>
				useMinimumTime(true, {
					time: 1000,
				})
			);

			act(() => {
				jest.advanceTimersByTime(1000);
			});

			expect(result.current).toBeTruthy();
		});

		it('should return true when timeout is not fired and loading changes', () => {
			const { result, rerender } = renderHook(
				({ loading }) => useMinimumTime(loading),
				{
					initialProps: {
						loading: true,
					},
				}
			);

			rerender({ loading: false });

			expect(result.current).toBeTruthy();
		});

		it('should return false when timeout fires and loading changes', async () => {
			jest.useFakeTimers();

			const { result, rerender } = renderHook(
				({ loading, props }) => useMinimumTime(loading, props),
				{
					initialProps: { loading: true, props: { time: 1000 } },
				}
			);

			await act(async () => {
				jest.advanceTimersByTime(1000);
			});

			rerender({ loading: false, props: { time: 1000 } });

			expect(result.current).toBeFalsy();
		});

		it('should return false when loading changes and timeout fires', async () => {
			jest.useFakeTimers();

			const { result, rerender } = renderHook(
				({ loading, props }) => useMinimumTime(loading, props),
				{
					initialProps: { loading: true, props: { time: 1000 } },
				}
			);

			rerender({ loading: false, props: { time: 1000 } });

			await act(async () => {
				jest.advanceTimersByTime(1000);
			});

			expect(result.current).toBeFalsy();
		});
	});
});
