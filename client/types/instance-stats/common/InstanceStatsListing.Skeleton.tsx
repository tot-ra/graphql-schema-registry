import { InstanceDescriptionTitleSkeleton } from '../../instance-description/InstanceDescriptionTitle.Skeleton';
import { MainViewContainer } from '../../../components/MainViewContainer';

type InstanceStatsListingSkeletonProps = {
	children: React.ReactNode;
};

export const InstanceStatsListingSkeleton = ({
	children,
}: InstanceStatsListingSkeletonProps) => (
	<MainViewContainer>
		<InstanceDescriptionTitleSkeleton />
		{children}
	</MainViewContainer>
);
