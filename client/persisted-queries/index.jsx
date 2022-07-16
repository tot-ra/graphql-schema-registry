import { useQuery } from '@apollo/client';

import SpinnerCenter from '../components/SpinnerCenter';
import PersistedQuery from './PersistedQuery';

import { PERSISTED_QUERIES } from '../utils/queries';

export default function PersistedQueries() {
	const { loading, data } = useQuery(PERSISTED_QUERIES);

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data || !data.persistedQueries.length) {
		return <div style={{ padding: 10 }}>No persisted queries found</div>;
	}

	return (
		<div>
			{data.persistedQueries.map((query) => (
				<PersistedQuery key={query.key} query={query} />
			))}
		</div>
	);
}
