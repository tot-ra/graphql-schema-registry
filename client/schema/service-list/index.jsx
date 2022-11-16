import { useQuery } from '@apollo/client';

import { ServiceListColumnEmpty } from '../styled';
import { SERVICES_LIST } from '../../utils/queries';

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

	return (
		<ListContainer>
			<NavigationList component="nav">
				{data.services.map((service) => (
					<NavigationListItem
						key={service.name}
						href={`/schema/${service.name}`}
						value={service.name}
						showNavigationChevron
					/>
				))}
			</NavigationList>
		</ListContainer>
	);
};

export default ServiceList;
