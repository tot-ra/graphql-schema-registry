import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';

import SpinnerCenter from '../../components/SpinnerCenter';
import { SchemaListColumn, FlexRow } from '../styled';
import VersionsList from './VersionsList';
import VersionDetails from './VersionDetails';

import { SERVICE_SCHEMAS } from '../../utils/queries';

const ServiceSchemas = ({ service }) => {
	const [filterValue] = useState('');
	const { loading, data, error } = useServiceSchemas(service.id, filterValue);
	const history = useHistory();
	const { serviceName, schemaId } = useParams();

	useEffect(() => {
		if (!data?.service?.schemas?.length || !serviceName) {
			return;
		}

		const selectedSchemaId = parseInt(schemaId, 10);
		const hasSelectedSchema = data.service.schemas.some(
			(schema) => schema.id === selectedSchemaId
		);

		if (!hasSelectedSchema) {
			history.replace(`/${serviceName}/${data.service.schemas[0].id}/sdl`);
		}
	}, [data, history, schemaId, serviceName]);

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
