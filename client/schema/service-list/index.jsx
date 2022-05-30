import { useQuery } from '@apollo/client';

import { ServiceListColumnEmpty } from '../styled';
import { SERVICES_LIST } from '../../utils/queries';

import {
	ListContainer,
	NavigationList,
	NavigationListItem,
} from '../../components/List';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);

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
