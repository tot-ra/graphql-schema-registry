import { List, ListItem } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ListContainer } from '../../components/List';

export const TypesCountingListSkeleton = () => (
	<ListContainer>
		<List>
			{Array(2)
				.fill(null)
				.map((_, index) => (
					<ListItem key={index}>
						<Skeleton variant="rect" width="100%" height={25} />
					</ListItem>
				))}
		</List>
		<List>
			{Array(6)
				.fill(null)
				.map((_, index) => (
					<ListItem key={index}>
						<Skeleton variant="rect" width="100%" height={25} />
					</ListItem>
				))}
		</List>
	</ListContainer>
);
