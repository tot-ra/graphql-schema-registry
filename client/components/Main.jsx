import { Route, useLocation } from 'react-router-dom';

import TopMenu from './TopMenu';
import TabPanel from './TabPanel';
import Schema from '../schema';
import PersistedQueries from '../persisted-queries';
import Clients from '../clients';

import ServicesTab from '../schema/Tab';
import PersistedQueriesTab from '../persisted-queries/Tab';
import Logs from '../logs';

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
	{
		Title: <span>Logs</span>,
		href: '/logs',
		component: Logs,
	},
];

const Main = () => {
	let selectedTab = 0;
	const location = useLocation();

	UITabs.forEach((tab, i) => {
		if (location.pathname === tab.href) {
			selectedTab = i;
		}
	});

	const handleChange = (event, newValue) => {
		selectedTab = newValue;
	};

	return (
		<div>
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
		</div>
	);
};

export default Main;
