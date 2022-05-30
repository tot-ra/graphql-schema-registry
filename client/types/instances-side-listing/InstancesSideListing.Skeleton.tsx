import { List, ListItem } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ListContainer } from '../../components/List';

export const InstancesSideListingSkeleton = () => (
	<ListContainer>
		<List>
			{Array(10)
				.fill(null)
				.map((_, index) => (
					<ListItem key={index}>
						<Skeleton variant="rect" width="100%" height={25} />
					</ListItem>
				))}
		</List>
	</ListContainer>
);
