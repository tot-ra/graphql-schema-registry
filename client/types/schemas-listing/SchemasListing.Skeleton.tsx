import { List, ListItem } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

type SchemasListingSkeletonProps = {
	schemas: number;
};

export const SchemasListingSkeleton = ({
	schemas,
}: SchemasListingSkeletonProps) => (
	<List component="nav" disablePadding dense>
		{Array(schemas)
			.fill(null)
			.map((_, index) => (
				<ListItem disableGutters key={index}>
					<Skeleton variant="rect" width="100%" height={20} />
				</ListItem>
			))}
	</List>
);
