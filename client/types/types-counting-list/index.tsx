import { ListCount } from '../../utils/queries';
import { useHistory } from 'react-router-dom';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { ServiceListColumn, ServiceListColumnEmpty } from '../../schema/styled';

type ServiceListProps = {
	operations: ListCount[];
	entities: ListCount[];
};

const ServiceList = ({ entities, operations }: ServiceListProps) => {
	if (!operations.length && !entities.length) {
		return (
			<ServiceListColumnEmpty>
				<p>No types found!</p>
			</ServiceListColumnEmpty>
		);
	}

	const history = useHistory();

	return (
		<ServiceListColumn>
			<List component="nav">
				{operations.map((operation) => (
					<ListItem
						key={operation.type}
						button
						onClick={() => history.push(`/types/${operation.type}`)}
						// selected={service.name === match?.params?.serviceName}
					>
						<ListItemText
							primary={operation.type}
							secondary={operation.count}
						/>
						<ListItemIcon>
							<ChevronRightIcon />
						</ListItemIcon>
					</ListItem>
				))}
			</List>
			<List component="nav">
				{entities.map((entity) => (
					<ListItem
						key={entity.type}
						button
						onClick={() => history.push(`/types/${entity.type}`)}
						// selected={service.name === match?.params?.serviceName}
					>
						<ListItemText
							primary={entity.type}
							secondary={entity.count}
						/>
						<ListItemIcon>
							<ChevronRightIcon />
						</ListItemIcon>
					</ListItem>
				))}
				{/* {data.services.map((service) => (
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
				))} */}
			</List>
		</ServiceListColumn>
	);
};

export default ServiceList;
