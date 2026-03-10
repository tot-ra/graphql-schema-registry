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
				TabIndicatorProps={{ style: { display: 'none' } }}
				style={{ flexGrow: 1, width: '100%' }}
			>
				{UITabs.map((tab, i) => {
					const isSelected = selectedTab === i;

					return (
						<Tab
							key={i}
							onClick={() => history.push(tab.href)}
							label={
								<span
									style={{
										width: '100%',
										textAlign: 'left',
										display: 'inline-flex',
										alignItems: 'center',
										gap: 10,
									}}
								>
									<span
										style={{
											width: 18,
											height: 18,
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										{tab.icon}
									</span>
									<span>{tab.Title}</span>
								</span>
							}
							style={{
								width: 'calc(100% - 16px)',
								maxWidth: 'none',
								alignItems: 'flex-start',
								justifyContent: 'flex-start',
								minHeight: 44,
								margin: '4px 8px',
								borderRadius: 8,
								paddingLeft: 16,
								paddingRight: 16,
								textTransform: 'none',
								textAlign: 'left',
								color: '#ffffff',
								fontWeight: isSelected ? 700 : 500,
								backgroundColor: isSelected
									? 'rgba(255, 255, 255, 0.26)'
									: 'transparent',
								border: isSelected
									? '1px solid rgba(255, 255, 255, 0.5)'
									: '1px solid transparent',
							}}
						/>
					);
				})}
			</Tabs>
		</AppBar>
	);
}
