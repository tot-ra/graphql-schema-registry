import { useQuery } from '@apollo/client';

import SpinnerCenter from '../components/SpinnerCenter';
import PersistedQuery from './PersistedQuery';

import { PERSISTED_QUERIES } from '../utils/queries';

const PersistedQueries = () => {
	const { loading, data } = useQuery(PERSISTED_QUERIES);

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data || !data.persistedQueries) {
		return <div>No persisted queries found</div>;
	}

	return (
		<div>
			{data.persistedQueries.map((query) => (
				<PersistedQuery key={query.key} query={query} />
			))}
		</div>
	);
};

export { default as Tab } from './Tab';

export default PersistedQueries;
