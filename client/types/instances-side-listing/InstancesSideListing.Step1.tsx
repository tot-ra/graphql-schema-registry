import { useQuery } from '@apollo/client';
import { ErrorRetry } from '../../components/ErrorRetry';
import { ListTypesOutput, LIST_TYPES } from '../../utils/queries';
import { InstancesSideListingSkeleton } from './InstancesSideListing.Skeleton';
import { InstancesSideListingStep2 } from './InstancesSideListing.Step2';

type InstancesSideListingStep1Props = {
	typeName: string;
	instanceId: string;
};

export const InstancesSideListingStep1 = ({
	typeName,
	instanceId,
}: InstancesSideListingStep1Props) => {
	const { loading, data, error, refetch } =
		useQuery<ListTypesOutput>(LIST_TYPES);

	if (loading) {
		return <InstancesSideListingSkeleton />;
	}

	if (error) {
		return <ErrorRetry onRetry={refetch} />;
	}

	const count =
		data?.listTypes.operations.find(
			(entity) => entity.type.toUpperCase() === typeName.toUpperCase()
		)?.count ??
		data?.listTypes.entities.find(
			(entity) => entity.type.toUpperCase() === typeName.toUpperCase()
		)?.count ??
		0;

	return (
		<InstancesSideListingStep2
			count={count}
			typeName={typeName}
			instanceId={instanceId}
		/>
	);
};
