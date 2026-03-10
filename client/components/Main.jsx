import { Route, useLocation, Switch, Redirect } from 'react-router-dom';

import TopMenu from './TopMenu';
import TabPanel from './TabPanel';
import {
	SchemaIcon,
	ServicesIcon,
	AnalyticsIcon,
	ClientsIcon,
	PersistedQueriesIcon,
	LogsIcon,
	ChangeLogIcon,
} from './MenuIcons';
import Services from '../schema';
import Analytics from '../analytics';
import SupergraphSchema from '../supergraph';
import PersistedQueries from '../persisted-queries';
import Clients from '../clients';
import SchemaChangeLog from '../schema-change-log';

import ServicesTab from '../schema/Tab';
import PersistedQueriesTab from '../persisted-queries/Tab';
import Logs from '../logs';

const UITabs = [
	{
		Title: <span>Schema</span>,
		icon: <SchemaIcon />,
		href: '/schema',
		component: SupergraphSchema,
	},
	{
		Title: <ServicesTab />,
		icon: <ServicesIcon />,
		href: '/services',
		component: Services,
	},
	{
		Title: <span>Analytics</span>,
		icon: <AnalyticsIcon />,
		href: '/analytics',
		component: Analytics,
	},
	{
		Title: <span>Clients</span>,
		icon: <ClientsIcon />,
		href: '/clients',
		component: Clients,
	},
	{
		Title: <PersistedQueriesTab />,
		icon: <PersistedQueriesIcon />,
		href: '/persisted-queries',
		component: PersistedQueries,
	},
	{
		Title: <span>Change Log</span>,
		icon: <ChangeLogIcon />,
		href: '/changes',
		component: SchemaChangeLog,
	},
	{
		Title: <span>Logs</span>,
		icon: <LogsIcon />,
		href: '/logs',
		component: Logs,
	},
];

const Main = () => {
	let selectedTab = 0;
	const location = useLocation();

	UITabs.forEach((tab, i) => {
		if (
			location.pathname === tab.href ||
			location.pathname.startsWith(`${tab.href}/`)
		) {
			selectedTab = i;
		}
	});

	const handleChange = (event, newValue) => {
		selectedTab = newValue;
	};

	return (
		<div className="registry-layout">
			<aside className="registry-sidebar">
				<TopMenu
					UITabs={UITabs}
					selectedTab={selectedTab}
					handleChange={handleChange}
				/>
			</aside>
			<main className="registry-content">
				<Switch>
					<Redirect exact from="/" to="/schema" />
					<Redirect exact from="/schema-change-log" to="/changes" />
					{UITabs.map((tab, index) => (
						<Route
							key={tab.href}
							path={`${tab.href}*`}
							render={() => (
								<TabPanel key={index} index={index} value={selectedTab}>
									<tab.component />
								</TabPanel>
							)}
						/>
					))}
				</Switch>
			</main>
		</div>
	);
};

export default Main;
