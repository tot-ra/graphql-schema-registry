import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../../components/SpinnerCenter';
import { ColumnPanel, FlexRow } from '../styled';
import VersionsList from './VersionsList';
import VersionDetails from './VersionDetails';

import { SERVICE_SCHEMAS } from '../../utils/queries';
import Filter from '../service-list/Filter';

const ServiceSchemas = ({ service }) => {
	const [filterValue, setFilterValue] = useState('');
	const { loading, data, error } = useServiceSchemas(service.id, filterValue);

	const content = loading ? (
		<SpinnerCenter />
	) : (
		<VersionsList service={data.service} filterValue={filterValue} />
	);

	if (!service.id || error) {
		return null;
	}

	return (
		<FlexRow>
			<ColumnPanel all="m">
				<Filter
					filterValue={filterValue}
					setFilterValue={setFilterValue}
				/>
				{content}
			</ColumnPanel>
			<VersionDetails />
		</FlexRow>
	);
};

export default ServiceSchemas;

function useServiceSchemas(serviceId, filterValue) {
	return useQuery(SERVICE_SCHEMAS, {
		variables: { id: serviceId, filter: filterValue },
		skip: !serviceId,
	});
}
