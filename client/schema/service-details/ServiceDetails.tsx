import { useParams } from 'react-router-dom';

import Empty from './Empty';
import ServiceSchemas from './ServiceSchemas';

import React, { useMemo } from 'react';
import { Service } from '../types';

interface ServiceDetailsProps {
	services: Service[];
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ services }) => {
	const { serviceName } = useParams<{ serviceName: string }>();

	const service = useMemo(() => {
		return services.find((service) => service.name === serviceName);
	}, [services, serviceName]);

	if (!services.length) {
		return null;
	}

	if (!service) {
		return <Empty />;
	}

	return <ServiceSchemas service={service} />;
};
