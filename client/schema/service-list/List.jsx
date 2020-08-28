import React from 'react';
import {Link, useRouteMatch} from 'react-router-dom';
import {EntryPanel, EntryGrid, EntryName} from '../../components/styled';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import List from '@material-ui/core/List';

const ServiceList = ({services}) => {
	const match = useRouteMatch('/:serviceName');

	return (
		<List component="nav">

		{services.map((service) => (
			<Link to={`/${service.name}`} key={service.id}>
				<EntryPanel selected={service.name === match?.params?.serviceName}>
					<EntryGrid>
						<EntryName>{service.name}</EntryName>
						<ArrowForwardIosIcon/>
					</EntryGrid>
				</EntryPanel>
			</Link>
		))}
		</List>
	);
};

export default ServiceList;
