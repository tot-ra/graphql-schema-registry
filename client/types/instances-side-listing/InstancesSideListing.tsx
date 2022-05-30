import { useParams } from 'react-router-dom';
import { InstancesSideListingStep1 } from './InstancesSideListing.Step1';

type InstancesSideListingProps = {
	buildHref?: Parameters<typeof InstancesSideListingStep1>[0]['buildHref'];
};

export const InstancesSideListing = ({
	buildHref,
}: InstancesSideListingProps) => {
	const { typeName, instanceId } = useParams<{
		typeName: string;
		instanceId: string;
	}>();

	return (
		<InstancesSideListingStep1
			typeName={typeName}
			instanceId={instanceId}
			buildHref={buildHref}
		/>
	);
};
