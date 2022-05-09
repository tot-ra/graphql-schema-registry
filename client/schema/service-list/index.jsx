import { useQuery } from '@apollo/client';

import { ServiceListColumnEmpty } from '../styled';

import { SERVICES_LIST } from '../../utils/queries';
import { useRouteMatch, useHistory } from 'react-router-dom';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { ListContainer } from '../../components/List';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);
	const match = useRouteMatch('/:serviceName');
	const history = useHistory();

	if (!data || !data.services || data.services.length === 0) {
		return (
			<ServiceListColumnEmpty>
				<p>No federated services found</p>
				<p>
					Use{' '}
					<a
						href={
							'https://github.com/pipedrive/graphql-schema-registry#post-schemapush'
						}
					>
						POST /schema/push
					</a>{' '}
					to add one
				</p>
			</ServiceListColumnEmpty>
		);
	}

	return (
		<ListContainer>
			<List component="nav">
				{data.services.map((service) => (
					<ListItem
						key={service.name}
						button
						onClick={() => history.push(`/schema/${service.name}`)}
						selected={service.name === match?.params?.serviceName}
					>
						<ListItemText primary={service.name} />
						<ListItemIcon>
							<ChevronRightIcon />
						</ListItemIcon>
					</ListItem>
				))}
			</List>
		</ListContainer>
	);
};

export default ServiceList;
