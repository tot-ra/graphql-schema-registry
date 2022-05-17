import { Skeleton } from '@material-ui/lab';
import { Container } from './InstanceDescriptionTitle';

export const InstanceDescriptionTitleSkeleton = () => (
	<Container>
		<Skeleton variant="rect" width="40%" height={40} />
		<Skeleton variant="rect" width="100%" height={25} />
		<Skeleton variant="rect" width="20%" height={15} />
	</Container>
);
