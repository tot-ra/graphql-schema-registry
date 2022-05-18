import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { Container } from '../styled';
import Empty from './Empty';
import ServiceSchemas from './ServiceSchemas';

import { SERVICES_LIST } from '../../utils/queries';

const ServiceDetails = () => {
	const { serviceName } = useParams();
	const { data } = useQuery(SERVICES_LIST);
	const service = data?.services.find(
		(service) => service.name === serviceName
	);

	if (!data) {
		return null;
	}

	if (!service) {
		return <Empty />;
	}

	return (
		<Container>
			<ServiceSchemas service={service} />
		</Container>
	);
};

export default ServiceDetails;
