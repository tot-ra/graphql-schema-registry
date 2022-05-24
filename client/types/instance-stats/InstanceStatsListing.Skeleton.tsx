import { MainViewContainer } from '../../shared/styled';
import { InstanceStatsClientSkeleton } from './InstanceStatsClient.Skeleton';
import { InstanceDescriptionTitleSkeleton } from '../instance-description/InstanceDescriptionTitle.Skeleton';

export const InstanceStatsListingSkeleton = () => (
	<MainViewContainer>
		<InstanceDescriptionTitleSkeleton />
		<InstanceStatsClientSkeleton amount={2} />
	</MainViewContainer>
);
