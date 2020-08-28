import React from 'react';
import PropTypes from 'prop-types';
import {Tabs, Box, Tab, Container, AppBar} from '@material-ui/core';
import {HashRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import {hot} from 'react-hot-loader';

import Schema from '../schema';
import PersistedQueries, {Tab as PersistedQueriesTab} from '../persisted-queries';

const UITabs = [
	{
		Title: (<span>Schema</span>),
		href: '/schema',
		icon: 'dashboard',
		component: Schema
	},
	{
		Title: (<PersistedQueriesTab />),
		icon: 'ac-document',
		href: '/persisted-queries',
		component: PersistedQueries
	}
];

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box p={3} key={index}>
					{children}
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired,
};

const Main = () => {
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<Router>
			<AppBar position="static">
				<Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
					{/*<React.Fragment>*/}
						{UITabs.map((tab, i) => (
							<Tab key={i} label={tab.Title}/>
						))}
					{/*</React.Fragment>*/}
				</Tabs>
			</AppBar>

			{UITabs.map((tab, index) => (
				<TabPanel key={index} index={index} value={value}>
					<Route key={tab.href} path={`${tab.href}*`} component={tab.component}/>
				</TabPanel>
			))}
			<Redirect to="/schema"/>

		</Router>
	);
};

export default hot(module)(Main);
