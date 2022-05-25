import {
	Route,
	Redirect,
	Switch,
	matchPath,
	useLocation,
} from 'react-router-dom';
import { useEffect, useState } from 'react';

import TopMenu from './TopMenu';
import Schema from '../schema';
import PersistedQueries, {
	Tab as PersistedQueriesTab,
} from '../persisted-queries';
import Types from '../types';
import styled from 'styled-components';
import { DateRangeSelectorProvider } from './DateRangeSelector.Context';

const MainContainer = styled.main`
	height: 100vh;
	display: grid;
	grid-template-rows: auto 1fr;
`;

export const UITabs = [
	{
		title: <span>Schema</span>,
		href: '/schema',
		icon: 'dashboard',
		component: Schema,
	},
	{
		title: <span>Types</span>,
		href: '/types',
		icon: 'dashboard',
		component: Types,
	},
	{
		title: <PersistedQueriesTab />,
		icon: 'ac-document',
		href: '/persisted-queries',
		component: PersistedQueries,
	},
];

const Main = () => {
	const { pathname } = useLocation();
	const [selectedTab, setSelectedTab] = useState(0);

	useEffect(() => {
		const index = UITabs.findIndex((tab) =>
			matchPath(pathname, {
				path: tab.href,
			})
		);
		setSelectedTab(index >= 0 ? index : 0);
	}, [pathname]);

	const handleChange = (newValue) => {
		setSelectedTab(newValue);
	};

	return (
		<MainContainer>
			<DateRangeSelectorProvider>
				<TopMenu
					tabs={UITabs}
					selectedTab={selectedTab}
					handleChange={handleChange}
				/>
				<Switch>
					{UITabs.map(({ component: Component, ...tab }) => (
						<Route key={tab.href} path={tab.href} exact={false}>
							<Component />
						</Route>
					))}
					<Redirect to="/schema" />
				</Switch>
			</DateRangeSelectorProvider>
		</MainContainer>
	);
};

export default Main;
