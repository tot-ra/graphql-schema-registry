import { useQuery } from '@apollo/client';
import { ErrorRetry } from '../../components/ErrorRetry';
import { MainViewContainer } from '../../components/MainViewContainer';
import useCommonParams from '../../shared/useCommonParams';
import useMinimumTime from '../../shared/useMinimumTime';
import {
	TypeInstanceOutput,
	TypeInstanceVars,
	TYPE_INSTANCE,
} from '../../utils/queries';
import { InstanceDescriptionSkeleton } from './InstanceDescription.Skeleton';
import { InstanceDescriptionTable } from './InstanceDescriptionTable';

export const InstanceDescription = () => {
	const { typeName, instanceId } = useCommonParams();

	const { loading, data, error, refetch } = useQuery<
		TypeInstanceOutput,
		TypeInstanceVars
	>(TYPE_INSTANCE, {
		variables: {
			type: typeName,
			instanceId,
		},
	});

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return <InstanceDescriptionSkeleton />;
	}

	if (error || !data) {
		return <ErrorRetry onRetry={refetch} />;
	}

	const { getTypeInstance: payload } = data;

	return (
		<MainViewContainer>
			<InstanceDescriptionTable {...payload} />
		</MainViewContainer>
	);
};
