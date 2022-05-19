import { Typography } from '@material-ui/core';
import { ReactNode } from 'react';
import { NormalizedLabel } from '../../shared/styled';

type InstancesListingTitleProps = {
	children: ReactNode;
};

export const InstancesListingTitle = ({
	children,
}: InstancesListingTitleProps) => (
	<Typography variant="h6" component={NormalizedLabel} as="h6">
		{children}
	</Typography>
);
