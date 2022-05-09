import { Route } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import MainSectionContainer from '../components/MainSectionContainer';
import SpinnerCenter from '../components/SpinnerCenter';
import VersionDetails from './version-details/VersionDetails';
import ServiceList from './service-list';
import ServiceDetails from './service-details';

import { SERVICES_LIST } from '../utils/queries';

const History = () => {
	const { loading } = useQuery(SERVICES_LIST);

	if (loading) {
		return <SpinnerCenter />;
	}

	return (
		<MainSectionContainer gridColumns="0.2fr 0.2fr 0.6fr">
			<ServiceList />
			<Route path="/schema/:serviceName">
				<ServiceDetails />
			</Route>
			<Route path="/schema/:serviceName/:schemaId">
				<VersionDetails />
			</Route>
		</MainSectionContainer>
	);
};

export default History;
