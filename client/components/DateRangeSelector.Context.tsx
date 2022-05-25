import React, { useCallback, useContext, useMemo, useState } from 'react';
import { DateRangeSelectorProps, getDefaultRange } from './DateRangeSelector';

export type DateRangeSelectorContextType = Required<DateRangeSelectorProps> & {
	reset: () => unknown;
};

type InternalContextHolderType = DateRangeSelectorContextType & {
	connected: boolean;
};

const DateRangeSelectorContext = React.createContext<InternalContextHolderType>(
	{
		range: getDefaultRange(),
		onRangeChange: () => null,
		reset: () => null,
		connected: false,
	}
);

type DateRangeSelectorProviderProps = {
	children: React.ReactNode;
};

export const DateRangeSelectorProvider = ({
	children,
}: DateRangeSelectorProviderProps) => {
	const [range, setRange] = useState<InternalContextHolderType['range']>(
		getDefaultRange()
	);

	const reset = useCallback(() => {
		setRange(getDefaultRange());
	}, []);

	const holder = useMemo<InternalContextHolderType>(
		() => ({
			range,
			onRangeChange: setRange,
			connected: true,
			reset,
		}),
		[range, reset]
	);

	return (
		<DateRangeSelectorContext.Provider value={holder}>
			{children}
		</DateRangeSelectorContext.Provider>
	);
};

type UseDateRangeSelectorType = () => DateRangeSelectorContextType;

export const useDateRangeSelector: UseDateRangeSelectorType = () => {
	const { connected, onRangeChange, range, reset } = useContext(
		DateRangeSelectorContext
	);

	if (!connected) {
		throw new Error(
			'This hook should be used below a DateRangeSelectorProvider'
		);
	}

	return {
		range,
		onRangeChange,
		reset,
	};
};
