import { Route, Redirect, Switch } from 'react-router-dom';

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

export const tabs = [
	{
		title: <span>Schema</span>,
		href: '/schema',
		component: Schema,
	},
	{
		title: <span>Types</span>,
		href: '/types',
		component: Types,
	},
	{
		title: <PersistedQueriesTab />,
		href: '/persisted-queries',
		component: PersistedQueries,
	},
];

const Main = () => (
	<MainContainer>
		<DateRangeSelectorProvider>
			<TopMenu tabs={tabs} />
			<Switch>
				{tabs.map(({ component: Component, href }) => (
					<Route key={href} path={href}>
						<Component />
					</Route>
				))}
				<Redirect to={tabs[0].href} />
			</Switch>
		</DateRangeSelectorProvider>
	</MainContainer>
);

export default Main;
