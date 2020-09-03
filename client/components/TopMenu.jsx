import { AppBar, Tab, Tabs } from '@material-ui/core';
import React from 'react';

import { useHistory } from 'react-router-dom';

export default ({ UITabs, selectedTab, handleChange }) => {
	let history = useHistory();

	return (
		<AppBar position="static">
			<Tabs
				value={selectedTab}
				onChange={handleChange}
				aria-label="simple tabs example"
			>
				{/*<React.Fragment>*/}
				{UITabs.map((tab, i) => (
					<Tab
						key={i}
						onClick={() => history.push(tab.href)}
						label={tab.Title}
					/>
				))}
				{/*</React.Fragment>*/}
			</Tabs>
		</AppBar>
	);
};
