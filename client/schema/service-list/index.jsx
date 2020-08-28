import React from 'react';
import { useQuery } from '@apollo/client';

import List from './List';
import { ColumnPanel } from '../styled';

import { SERVICES_LIST } from '../../utils/queries';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);

	if (!data) {
		return null;
	}

	if (!data || !data.services) {
		return <div>No registered services found</div>;
	}

	return (
		<ColumnPanel>
			<List services={data.services} />
		</ColumnPanel>
	);
};

export default ServiceList;
