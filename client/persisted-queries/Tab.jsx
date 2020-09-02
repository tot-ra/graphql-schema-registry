import React from 'react';
import { useQuery } from '@apollo/client';
import { PERSISTED_QUERIES_COUNT } from '../utils/queries';

const PersistedQueriesTab = () => {
	const { data } = useQuery(PERSISTED_QUERIES_COUNT);

	return (
		<span>
			Persisted queries {data && `(${data.persistedQueriesCount})`}
		</span>
	);
};

export default PersistedQueriesTab;
