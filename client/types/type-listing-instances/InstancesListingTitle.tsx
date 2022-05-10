import { makeStyles, Typography } from '@material-ui/core';
import { ReactNode } from 'react';

type InstancesListingTitleProps = {
	children: ReactNode;
};

const useStyles = makeStyles({
	h5: {
		textTransform: 'capitalize',
	},
});

export const InstancesListingTitle = ({
	children,
}: InstancesListingTitleProps) => {
	const styles = useStyles();

	return (
		<Typography variant="h5" className={styles.h5}>
			{children}
		</Typography>
	);
};
