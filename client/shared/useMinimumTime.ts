import { useEffect, useMemo, useRef, useState } from 'react';

type UseMinimumTimeSettings = {
	time?: number;
};

type UseMinimumTimeResult = boolean;

const defaultSettings: Required<UseMinimumTimeSettings> = {
	time: 300,
};

export default function useMinimumTime(
	loading: boolean,
	settings?: UseMinimumTimeSettings
): UseMinimumTimeResult {
	const { time } = useMemo(
		() => ({
			...defaultSettings,
			...settings,
		}),
		[settings]
	);
	const [fireTimeout, setFireTimeout] = useState(false);
	const [timeoutElapsed, setTimeoutElapsed] = useState(false);
	const timeRef = useRef(time);

	useEffect(() => {
		if (loading) {
			setTimeoutElapsed(false);
			setFireTimeout(true);
		}
	}, [loading]);

	useEffect(() => {
		timeRef.current = time;
	}, [time]);

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;
		if (fireTimeout) {
			timeoutId = setTimeout(() => {
				setTimeoutElapsed(true);
				setFireTimeout(false);
			}, timeRef.current);
		}
		return () => {
			clearTimeout(timeoutId);
		};
	}, [fireTimeout]);

	return fireTimeout ? !timeoutElapsed || loading : loading;
}
