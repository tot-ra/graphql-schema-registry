import React from 'react';
import { useQuery } from '@apollo/client';

import { ServiceListColumn, ServiceListColumnEmpty } from '../styled';

import { SERVICES_LIST } from '../../utils/queries';
import { useRouteMatch, useHistory } from 'react-router-dom';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);

	if (!data || !data.services || data.services.length === 0) {
		return <ServiceListColumnEmpty>
			<p>No federated services found</p>
			<p>Use <a href={"https://github.com/pipedrive/graphql-schema-registry#post-schemapush"}>POST /schema/push</a> to add one</p>

		</ServiceListColumnEmpty>;
	}

	const match = useRouteMatch('/:serviceName');
	let history = useHistory();

	return (
		<ServiceListColumn>
			<List component="nav">
				{data.services.map((service) => (
					<ListItem
						key={service.name}
						button
						onClick={() => history.push(`/${service.name}`)}
						selected={service.name === match?.params?.serviceName}
					>
						<ListItemText primary={service.name} />
						<ListItemIcon>
							<ChevronRightIcon />
						</ListItemIcon>
					</ListItem>
				))}
			</List>
		</ServiceListColumn>
	);
};

export default ServiceList;
