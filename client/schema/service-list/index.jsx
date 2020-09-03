import React from 'react';
import { useQuery } from '@apollo/client';

import { ColumnPanel } from '../styled';

import { SERVICES_LIST } from '../../utils/queries';
import { useRouteMatch, useHistory } from 'react-router-dom';

import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);

	if (!data) {
		return null;
	}

	if (!data || !data.services) {
		return <div>No registered services found</div>;
	}

	const match = useRouteMatch('/:serviceName');
	let history = useHistory();

	return (
		<ColumnPanel>
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
							<ArrowForwardIosIcon />
						</ListItemIcon>
					</ListItem>
				))}
			</List>
		</ColumnPanel>
	);
};

export default ServiceList;
