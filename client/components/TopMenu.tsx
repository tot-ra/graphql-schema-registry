import { AppBar, Box, Tab, Tabs, Toolbar } from '@material-ui/core';
import { Link, Route, useRouteMatch } from 'react-router-dom';
import ReactLogo from './logo';
import DateRangeSelector from './DateRangeSelector';
import { ReactNode, useEffect } from 'react';
import { colors } from '../utils';
import { useDateRangeSelector } from './DateRangeSelector.Context';

type TopMenuProps = {
	tabs: {
		title: ReactNode;
		href: string;
	}[];
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

export default function TopMenu({ tabs }: TopMenuProps) {
	const routeMatch = useRouteMatch(tabs.map((tab) => tab.href));
	const currentTab = routeMatch?.path;

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
						value={currentTab}
						aria-label="main sections"
						component="nav"
					>
						{tabs.map((tab) => (
							<Tab
								key={tab.href}
								value={tab.href}
								label={tab.title}
								component={Link}
								to={tab.href}
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
