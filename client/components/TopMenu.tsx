import { AppBar, Box, Tab, Tabs, Toolbar } from '@material-ui/core';
import { Route, useHistory } from 'react-router-dom';
import ReactLogo from './logo';
import DateRangeSelector from './DateRangeSelector';
import { ReactNode, useCallback, useEffect } from 'react';
import { colors } from '../utils';
import { useDateRangeSelector } from './DateRangeSelector.Context';

type TopMenuProps = {
	tabs: {
		title: ReactNode;
		href: string;
	}[];
	selectedTab: number;
	handleChange: (newTab: number) => unknown;
};

const DateRangeSelectorHolder = () => {
	const { range, onRangeChange, reset } = useDateRangeSelector();

	useEffect(
		() => () => {
			reset();
		},
		[reset]
	);

	return <DateRangeSelector range={range} onRangeChange={onRangeChange} />;
};

export default function TopMenu({
	tabs,
	selectedTab,
	handleChange,
}: TopMenuProps) {
	const history = useHistory();

	const onTabChange = useCallback(
		(_, newTab) => {
			handleChange(newTab);
		},
		[handleChange]
	);

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar
				position="static"
				color="primary"
				style={{
					backgroundColor: colors.green.hex,
					boxShadow: 'none',
				}}
			>
				<Toolbar style={{ minHeight: 'unset' }}>
					<ReactLogo />
					<Tabs
						value={selectedTab}
						onChange={onTabChange}
						aria-label="simple tabs example"
					>
						{tabs.map((tab) => (
							<Tab
								key={tab.href}
								onClick={() => history.push(tab.href)}
								label={tab.title}
							/>
						))}
					</Tabs>
					<Route path="/types/:typeName/:instanceId/stats" exact>
						<Box sx={{ flexGrow: 1 }} />
						<DateRangeSelectorHolder />
					</Route>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
