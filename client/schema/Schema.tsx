import React from 'react';
import { Route, HashRouter as Router } from 'react-router-dom';

import MainSectionContainer from '../components/MainSectionContainer';
import SpinnerCenter from '../components/SpinnerCenter';
import { ServiceList } from './service-list/ServiceList';
import { ServiceDetails } from './service-details/ServiceDetails';
import VersionDetails from './service-details/VersionDetails';

import { ServicesSort } from './ServicesSort/ServicesSort';
import { useSchema } from './useSchema';
import { StyledListSection } from './styled';

export const Schema: React.FC = () => {
	const { sort, setSort, services, loading } = useSchema();

	if (loading) {
		return <SpinnerCenter />;
	}

	return (
		<Router basename="/schema">
			<MainSectionContainer gridColumns="0.2fr 0.2fr 0.6fr">
				<StyledListSection>
					<ServicesSort setSort={setSort} sort={sort} />
					<ServiceList services={services} />
				</StyledListSection>
				<Route path="/:serviceName?/:schemaId?">
					<ServiceDetails services={services} />
				</Route>
				<VersionDetails />
			</MainSectionContainer>
		</Router>
	);
};
