import { useState } from 'react';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../../components/SpinnerCenter';
import VersionsList from './VersionsList';

import { SERVICE_SCHEMAS } from '../../utils/queries';
import Filter from '../service-list/Filter';
import { ListContainer } from '../../components/List';
import styled from 'styled-components';

const CustomListcontainer = styled(ListContainer)`
	display: grid;
	grid-template-rows: auto 1fr;
`;

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
		<CustomListcontainer>
			<Filter filterValue={filterValue} setFilterValue={setFilterValue} />
			{content}
		</CustomListcontainer>
	);
};

export default ServiceSchemas;

function useServiceSchemas(serviceId, filterValue) {
	return useQuery(SERVICE_SCHEMAS, {
		variables: { id: serviceId, filter: filterValue },
		skip: !serviceId,
	});
}
