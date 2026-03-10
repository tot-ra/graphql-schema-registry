import { AppBar, Tab, Tabs } from '@material-ui/core';
import ReactLogo from './logo';
import { useHistory } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';

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
				flexDirection: 'column',
				height: '100%',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					padding: '12px 0 8px',
				}}
			>
				<ReactLogo />
			</div>

			<div
				style={{
					padding: '0 12px 10px',
					borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
				}}
			>
				<GlobalSearch />
			</div>

			<Tabs
				orientation="vertical"
				variant="scrollable"
				value={selectedTab}
				onChange={handleChange}
				aria-label="Schema registry sections"
				style={{ flexGrow: 1, width: '100%' }}
			>
				{UITabs.map((tab, i) => (
					<Tab
						key={i}
						onClick={() => history.push(tab.href)}
						label={
							<span style={{ width: '100%', textAlign: 'left' }}>
								{tab.Title}
							</span>
						}
						style={{
							width: '100%',
							maxWidth: 'none',
							alignItems: 'flex-start',
							justifyContent: 'flex-start',
							minHeight: 44,
							paddingLeft: 16,
							paddingRight: 16,
							textTransform: 'none',
							textAlign: 'left',
						}}
					/>
				))}
			</Tabs>
		</AppBar>
	);
}
