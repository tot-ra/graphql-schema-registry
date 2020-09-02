import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
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
		<Router basename="/schema">
			<FlexRow>
				<ServiceList />
				<Route
					path="/:serviceName?/:schemaId?"
					component={ServiceDetails}
				/>
			</FlexRow>
		</Router>
	);
};

export default History;
