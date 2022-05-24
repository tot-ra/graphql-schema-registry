import { Skeleton } from '@material-ui/lab';
import { InstanceStatsClientVersionsTableSkeleton } from './InstanceStatsClientVersionsTable.Skeleton';
import { Container } from './InstanceStatsListing';

type InstanceStatsClientSkeletonProps = {
	amount?: number;
};

export const InstanceStatsClientSkeleton = ({
	amount = 1,
}: InstanceStatsClientSkeletonProps) => (
	<Container>
		<Skeleton variant="rect" width="30%" height={20} />
		{Array(amount)
			.fill(null)
			.map((_, index) => (
				<InstanceStatsClientVersionsTableSkeleton key={index} />
			))}
	</Container>
);
