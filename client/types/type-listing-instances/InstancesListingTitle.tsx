import { Typography } from '@material-ui/core';
import { ReactNode } from 'react';
import { NormalizedLabel } from '../../shared/styled';

type InstancesListingTitleProps = {
	children: ReactNode;
};

export const InstancesListingTitle = ({
	children,
}: InstancesListingTitleProps) => (
	<Typography variant="h5" component={NormalizedLabel} as="h5">
		{children}
	</Typography>
);
