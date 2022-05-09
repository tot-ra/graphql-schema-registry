import {
	Route,
	Redirect,
	Switch,
	matchPath,
	useLocation,
} from 'react-router-dom';
import { useState } from 'react';

import TopMenu from './TopMenu';
import Schema from '../schema';
import PersistedQueries, {
	Tab as PersistedQueriesTab,
} from '../persisted-queries';
import Types from '../types';

const UITabs = [
	{
		Title: <span>Schema</span>,
		href: '/schema',
		icon: 'dashboard',
		component: Schema,
	},
	{
		Title: <span>Types</span>,
		href: '/types',
		icon: 'dashboard',
		component: Types,
	},
	{
		Title: <PersistedQueriesTab />,
		icon: 'ac-document',
		href: '/persisted-queries',
		component: PersistedQueries,
	},
];

const Main = () => {
	const { pathname } = useLocation();
	const [selectedTab, setValue] = useState(() => {
		const index = UITabs.findIndex((tab) =>
			matchPath(pathname, {
				path: tab.href,
			})
		);
		return index >= 0 ? index : 0;
	});

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<>
			<TopMenu
				UITabs={UITabs}
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
		</>
	);
};

export default Main;
