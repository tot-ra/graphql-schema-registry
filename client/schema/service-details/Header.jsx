import React from 'react';

import { ServiceDetailsHeader, Heading } from '../styled';

const Header = ({ service }) => {
	if (!service) {
		return null;
	}

	return (
		<ServiceDetailsHeader>
			<Heading>{service.name}</Heading>
		</ServiceDetailsHeader>
	);
};

export default Header;
