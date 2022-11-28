import { useQuery } from '@apollo/client';

import { ServiceListColumnEmpty } from '../styled';

import { SERVICES_LIST } from '../../utils/queries';
import { useRouteMatch, useHistory } from 'react-router-dom';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { ListContainer, NavigationList } from '../../components/List';
import Info from '../../components/Info';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);
	const match = useRouteMatch('/:serviceName');
	const history = useHistory();

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

	return (
		<ListContainer>
			<NavigationList component="nav">
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
			</NavigationList>
		</ListContainer>
	);
};

export default ServiceList;
