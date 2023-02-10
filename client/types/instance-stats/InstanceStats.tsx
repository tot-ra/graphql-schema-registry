import useCommonParams from '../../shared/useCommonParams';
import { InstanceStatsRootField } from './InstanceStats.RootField';
import { InstanceStatsObject } from './InstanceStats.Object';

export const InstanceStats = () => {
	const { typeName } = useCommonParams();

	if (typeName === 'query' || typeName === 'mutation') {
		return <InstanceStatsRootField />;
	}

	if (typeName === 'object') {
		return <InstanceStatsObject />;
	}

	return null;
};
