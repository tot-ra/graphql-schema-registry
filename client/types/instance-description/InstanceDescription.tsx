import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { ErrorRetry } from '../../components/ErrorRetry';
import { MainViewContainer } from '../../shared/styled';
import useMinimumTime from '../../shared/useMinimumTime';
import {
	TypeInstanceOutput,
	TypeInstanceVars,
	TYPE_INSTANCE,
} from '../../utils/queries';
import { InstanceDescriptionSkeleton } from './InstanceDescription.Skeleton';
import { InstanceDescriptionTable } from './InstanceDescriptionTable';

const safeParseInt = (input: string): number | undefined => {
	if (/\d+/.test(input)) {
		return parseInt(input, 10);
	}
	return undefined;
};

export const InstanceDescription = () => {
	const { typeName, instanceId } = useParams<{
		typeName: string;
		instanceId: string;
	}>();

	const effectiveInstanceId = safeParseInt(instanceId) ?? -1;

	const { loading, data, error, refetch } = useQuery<
		TypeInstanceOutput,
		TypeInstanceVars
	>(TYPE_INSTANCE, {
		variables: {
			type: typeName,
			instanceId: effectiveInstanceId,
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
