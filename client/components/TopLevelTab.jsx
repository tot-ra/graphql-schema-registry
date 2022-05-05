import Tabs from '@material-ui/core/Tabs';
import { Link, useRouteMatch } from 'react-router-dom';

const TopLevelTab = ({ tab }) => {
	const match = useRouteMatch(tab.href);

	return (
		<Link to={tab.href}>
			<Tabs.Tab active={Boolean(match)}>
				<tab.Title />
			</Tabs.Tab>
		</Link>
	);
};

export default TopLevelTab;
