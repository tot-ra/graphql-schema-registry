import { Container } from './InstanceDescriptionTable';
import { InstanceDescriptionTableFieldsSkeleton } from './InstanceDescriptionTable.Fields.Skeleton';
import { InstanceDescriptionTitleSkeleton } from './InstanceDescriptionTitle.Skeleton';

export const InstanceDescriptionTableSkeleton = () => {
	return (
		<Container>
			<InstanceDescriptionTitleSkeleton />
			<InstanceDescriptionTableFieldsSkeleton rows={2} />
			<InstanceDescriptionTableFieldsSkeleton rows={4} />
		</Container>
	);
};
