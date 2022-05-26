import useCommonParams from '../../shared/useCommonParams';
import { InstanceStatsOperation } from './InstanceStats.Operation';
import { InstanceStatsEntity } from './InstanceStats.Entity';

export const InstanceStats = () => {
	const { typeName } = useCommonParams();

	if (typeName === 'query' || typeName === 'mutation') {
		return <InstanceStatsOperation />;
	}

	if (typeName === 'object') {
		return <InstanceStatsEntity />;
	}

	return null;
};
