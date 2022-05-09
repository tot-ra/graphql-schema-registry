import { Route } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { FlexRow } from './styled';
import SpinnerCenter from '../components/SpinnerCenter';
import ServiceList from './service-list';
import ServiceDetails from './service-details';

import { SERVICES_LIST } from '../utils/queries';

const History = () => {
	const { loading } = useQuery(SERVICES_LIST);

	if (loading) {
		return <SpinnerCenter />;
	}

	return (
		<FlexRow>
			<ServiceList />
			<Route
				path="/schema/:serviceName?/:schemaId?"
				component={ServiceDetails}
			/>
		</FlexRow>
	);
};

export default History;
