import { useQuery } from '@apollo/client';

import { ServiceListColumn, ServiceListColumnEmpty } from '../styled';

import { SERVICES_LIST } from '../../utils/queries';
import { useRouteMatch, useHistory } from 'react-router-dom';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import Info from '../../components/Info';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);

	if (!data || !data.services || data.services.length === 0) {
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

	const match = useRouteMatch('/:serviceName');
	const history = useHistory();

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
