import React from 'react';
import { Tabs, Box, Tab, Container, AppBar } from '@material-ui/core';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { hot } from 'react-hot-loader';

import TopMenu from './TopMenu';
import TabPanel from './TabPanel';
import Schema from '../schema';
import PersistedQueries, {
	Tab as PersistedQueriesTab,
} from '../persisted-queries';

const UITabs = [
	{
		Title: <span>Schema</span>,
		href: '/schema',
		icon: 'dashboard',
		component: Schema,
	},
	{
		Title: <PersistedQueriesTab />,
		icon: 'ac-document',
		href: '/persisted-queries',
		component: PersistedQueries,
	},
];

const Main = () => {
	const [selectedTab, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<Router>
			<TopMenu
				UITabs={UITabs}
				selectedTab={selectedTab}
				handleChange={handleChange}
			/>

			{UITabs.map((tab, index) => (
				<TabPanel key={index} index={index} value={selectedTab}>
					<Route
						key={tab.href}
						path={`${tab.href}*`}
						component={tab.component}
					/>
				</TabPanel>
			))}
			<Redirect to="/schema" />
		</Router>
	);
};

export default hot(module)(Main);
