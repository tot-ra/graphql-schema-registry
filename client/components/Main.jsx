import { Route, useLocation, Switch, Redirect } from 'react-router-dom';

import TopMenu from './TopMenu';
import TabPanel from './TabPanel';
import {
	SchemaIcon,
	ServicesIcon,
	AnalyticsIcon,
	PersistedQueriesIcon,
	LogsIcon,
	ChangeLogIcon,
	SubscriptionsIcon,
} from './MenuIcons';
import Services from '../schema';
import Analytics from '../analytics';
import SupergraphSchema from '../supergraph';
import PersistedQueries from '../persisted-queries';
import SchemaChangeLog from '../schema-change-log';
import Subscriptions from '../subscriptions';

import ServicesTab from '../schema/Tab';
import PersistedQueriesTab from '../persisted-queries/Tab';
import Logs from '../logs';

const UITabs = [
	{
		Title: <span>Schema</span>,
		pageTitle: 'Schema',
		icon: <SchemaIcon />,
		href: '/schema',
		component: SupergraphSchema,
	},
	{
		Title: <ServicesTab />,
		pageTitle: 'Services',
		icon: <ServicesIcon />,
		href: '/services',
		component: Services,
	},
	{
		Title: <span>Analytics</span>,
		pageTitle: 'Analytics',
		icon: <AnalyticsIcon />,
		href: '/analytics',
		component: Analytics,
	},
	{
		Title: <span>Subscriptions</span>,
		pageTitle: 'Subscriptions',
		icon: <SubscriptionsIcon />,
		href: '/subscriptions',
		component: Subscriptions,
	},
	{
		Title: <PersistedQueriesTab />,
		pageTitle: 'Persisted Queries',
		icon: <PersistedQueriesIcon />,
		href: '/persisted-queries',
		component: PersistedQueries,
	},
	{
		Title: <span>Change Log</span>,
		pageTitle: 'Change Log',
		icon: <ChangeLogIcon />,
		href: '/changes',
		component: SchemaChangeLog,
	},
	{
		Title: <span>Logs</span>,
		pageTitle: 'Logs',
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
									<div className="registry-page-shell">
										<h1 className="registry-page-title">{tab.pageTitle}</h1>
										<tab.component />
									</div>
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
