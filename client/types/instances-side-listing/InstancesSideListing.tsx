import { useParams } from 'react-router-dom';

import { InstancesSideListingStep1 } from './InstancesSideListing.Step1';

export const InstancesSideListing = () => {
	const { typeName, instanceId } = useParams<{
		typeName: string;
		instanceId: string;
	}>();

	return (
		<InstancesSideListingStep1
			typeName={typeName}
			instanceId={instanceId}
		/>
	);
};
