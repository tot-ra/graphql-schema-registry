import { useState } from 'react';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../../components/SpinnerCenter';
import { SchemaListColumn, FlexRow } from '../styled';
import VersionsList from './VersionsList';
import VersionDetails from './VersionDetails';

import { SERVICE_SCHEMAS } from '../../utils/queries';

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
		<FlexRow>
			<SchemaListColumn all="m">{content}</SchemaListColumn>
			<VersionDetails />
		</FlexRow>
	);
};

export default ServiceSchemas;

function useServiceSchemas(serviceId) {
	return useQuery(SERVICE_SCHEMAS, {
		variables: { id: serviceId },
		skip: !serviceId,
	});
}
