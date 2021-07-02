import {AppBar, Tab, Tabs} from '@material-ui/core';
import React from 'react';
import ReactLogo from './logo';
import {useHistory} from 'react-router-dom';

export default ({UITabs, selectedTab, handleChange}) => {
	let history = useHistory();

	return (
		<div style={{display: "flex"}}>
			<ReactLogo/>
			<AppBar position="static" color="primary" style={{backgroundColor:"#2b8223"}}>
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
		</div>

	);
};
