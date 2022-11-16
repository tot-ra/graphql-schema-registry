import { useState } from 'react';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../../components/SpinnerCenter';
import VersionsList from './VersionsList';
import { SERVICE_SCHEMAS } from '../../utils/queries';
import { SchemaListColumn } from '../styled';
import { ListContainer } from '../../components/List';
import styled from 'styled-components';

const CustomListcontainer = styled(ListContainer)`
	display: grid;
	grid-template-rows: auto 1fr;
`;

const ServiceSchemas = ({ service }) => {
	const [filterValue] = useState('');
	const { loading, data, error } = useServiceSchemas(service.id, filterValue);

	const content = loading ? (
		<SpinnerCenter />
	) : (
		<VersionsList service={data.service} />
	);

	if (!service.id || error) {
		return null;
	}

	return (
		<CustomListcontainer>
			<SchemaListColumn all="m">{content}</SchemaListColumn>
		</CustomListcontainer>
	);
};

export default ServiceSchemas;

function useServiceSchemas(serviceId) {
	return useQuery(SERVICE_SCHEMAS, {
		variables: { id: serviceId },
		skip: !serviceId,
	});
}
