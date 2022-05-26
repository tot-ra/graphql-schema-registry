import { Skeleton } from '@material-ui/lab';
import { InstanceStatsTableSkeleton } from '../common/InstanceStatsTable.Skeleton';
import { Container } from '../common/InstanceStatsListing';

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
				<InstanceStatsTableSkeleton key={index} />
			))}
	</Container>
);
