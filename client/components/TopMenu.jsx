import { AppBar, Tab, Tabs } from '@material-ui/core';
import ReactLogo from './logo';
import { useHistory } from 'react-router-dom';

export default function TopMenu({ UITabs, selectedTab, handleChange }) {
	const history = useHistory();

	return (
		<AppBar
			position="static"
			color="primary"
			style={{
				backgroundColor: 'green',
				boxShadow: 'none',
				display: 'flex',
				flexDirection: 'row',
			}}
		>
			<ReactLogo />

			<Tabs
				value={selectedTab}
				onChange={handleChange}
				aria-label="simple tabs example"
			>
				{/* <React.Fragment>*/}
				{UITabs.map((tab, i) => (
					<Tab
						key={i}
						onClick={() => history.push(tab.href)}
						label={tab.Title}
					/>
				))}
				{/* </React.Fragment>*/}
			</Tabs>
		</AppBar>
	);
}
