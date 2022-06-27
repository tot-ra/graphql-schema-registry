import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export const safeParseInt = (input: string): number | undefined => {
	if (/\d+/.test(input)) {
		return parseInt(input, 10);
	}
	return undefined;
};

type Params<InstanceIDType = string> = {
	typeName: string;
	instanceId: InstanceIDType;
};

type UseCommonParamsType = () => Partial<Params<number>>;

const useCommonParams: UseCommonParamsType = () => {
	const { typeName, instanceId = '' } = useParams<Partial<Params>>();

	return useMemo(
		() => ({
			typeName,
			instanceId: safeParseInt(instanceId),
		}),
		[instanceId, typeName]
	);
};

export default useCommonParams;
