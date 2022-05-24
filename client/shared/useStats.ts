import { useCallback, useMemo } from 'react';

type UseStatsBuildUrl = (id: string | number) => string;

type UseStatsType = (typeName: string) => [boolean, UseStatsBuildUrl];

const withStats = ['query', 'mutation', 'object'];

const useStats: UseStatsType = (typeName) => {
	const hasStats = useMemo(
		() => withStats.includes(typeName.toLowerCase()),
		[typeName]
	);

	const buildUrl = useCallback(
		(id: string | number) => `/types/${typeName.toLowerCase()}/${id}/stats`,
		[typeName]
	);

	return useMemo(() => [hasStats, buildUrl], [buildUrl, hasStats]);
};

export default useStats;
