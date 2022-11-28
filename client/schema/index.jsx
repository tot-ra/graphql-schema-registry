import { Route, HashRouter as Router } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import MainSectionContainer from '../components/MainSectionContainer';
import SpinnerCenter from '../components/SpinnerCenter';
import ServiceList from './service-list';
import ServiceDetails from './service-details';
import VersionDetails from './service-details/VersionDetails';

import { SERVICES_LIST } from '../utils/queries';

const History = () => {
	const { loading } = useQuery(SERVICES_LIST);

	if (loading) {
		return <SpinnerCenter />;
	}

	return (
		<Router basename="/schema">
			<MainSectionContainer gridColumns="0.2fr 0.2fr 0.6fr">
				<ServiceList />
				<Route
					path="/:serviceName?/:schemaId?"
					component={ServiceDetails}
				/>
				<VersionDetails />
			</MainSectionContainer>
		</Router>
	);
};

export default History;
