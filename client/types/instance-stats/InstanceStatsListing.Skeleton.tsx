import { InstanceStatsClientSkeleton } from './InstanceStatsClient.Skeleton';
import { InstanceDescriptionTitleSkeleton } from '../instance-description/InstanceDescriptionTitle.Skeleton';
import { MainViewContainer } from '../../components/MainViewContainer';

export const InstanceStatsListingSkeleton = () => (
	<MainViewContainer>
		<InstanceDescriptionTitleSkeleton />
		<InstanceStatsClientSkeleton amount={2} />
	</MainViewContainer>
);
