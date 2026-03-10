import { useQuery } from '@apollo/client';

import { ServiceListColumn, ServiceListColumnEmpty } from '../styled';

import { SERVICES_LIST } from '../../utils/queries';
import { useRouteMatch, useHistory } from 'react-router-dom';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import Info from '../../components/Info';
import { ServiceLabel, ServiceStatusDot } from './styled';

const ServiceList = () => {
	const { data } = useQuery(SERVICES_LIST);

	if (!data || !data.services || data.services.length === 0) {
		return (
			<ServiceListColumnEmpty>
				<Info>
					No federated services found.
					<br />
					Register your first service with{' '}
					<a
						href={
							'https://github.com/pipedrive/graphql-schema-registry#-post-schemapush'
						}
					>
						POST /schema/push
					</a>
					:
					<pre
						style={{
							margin: '8px 0 0',
							padding: 10,
							backgroundColor: 'rgba(0, 0, 0, 0.25)',
							whiteSpace: 'pre-wrap',
							wordBreak: 'break-word',
						}}
					>
						{`curl -X POST http://localhost:6001/schema/push \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "products",
    "kind": "federated",
    "url": "http://localhost:4001/graphql",
    "typeDefs": "type Query { products: [Product!]! } type Product @key(fields: \\"id\\") { id: ID! name: String! }",
    "version": "v1"
  }'`}
					</pre>
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
						<ListItemText
							primary={
								<ServiceLabel>
									<ServiceStatusDot
										status={service.healthStatus}
										title={
											service.healthStatus === 'UP' ? 'Service is up' : 'Service is down'
										}
									/>
									<span>{service.name}</span>
								</ServiceLabel>
							}
						/>
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
