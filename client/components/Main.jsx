import React from 'react';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';

import TopMenu from './TopMenu';
import TabPanel from './TabPanel';
import Schema from '../schema';
import PersistedQueries from '../persisted-queries';
import Clients from '../clients';

import ServicesTab from '../schema/Tab';
import PersistedQueriesTab from '../persisted-queries/Tab';

const UITabs = [
	{
		Title: <ServicesTab />,
		href: '/schema',
		component: Schema,
	},
	{
		Title: <span>Clients</span>,
		href: '/clients',
		component: Clients,
	},
	{
		Title: <PersistedQueriesTab />,
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

export default Main;
