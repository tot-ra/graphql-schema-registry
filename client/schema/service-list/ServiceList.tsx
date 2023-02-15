import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

import { ServiceListColumnEmpty } from '../styled';

import { ListContainer, NavigationList } from '../../components/List';
import Info from '../../components/Info';
import { Service } from '../types';

interface ServiceListProps {
	services: Service[];
}

export const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
	const match = useRouteMatch<{ serviceName: string }>('/:serviceName');
	const history = useHistory();

	if (!services.length) {
		return (
			<ServiceListColumnEmpty>
				<Info>
					No federated services found
					<br />
					Use{' '}
					<a
						href={
							'https://github.com/pipedrive/graphql-schema-registry#-post-schemapush'
						}
					>
						POST /schema/push
					</a>{' '}
					to add one
				</Info>
			</ServiceListColumnEmpty>
		);
	}

	return (
		<ListContainer>
			<NavigationList component="nav">
				{services.map((service) => (
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
			</NavigationList>
		</ListContainer>
	);
};
