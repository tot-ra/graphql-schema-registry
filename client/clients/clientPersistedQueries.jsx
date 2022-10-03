// eslint-disable-next-line
import React from 'react';
import { useQuery } from '@apollo/client';

import PersistedQuery from '../persisted-queries/PersistedQuery';
import SpinnerCenter from '../components/SpinnerCenter';
import { CLIENT_VERSION_PERSISTED_QUERIES } from '../utils/queries';

const ClientPersistedQueries = ({ selectedVersion }) => {
	if (!selectedVersion) {
		return null;
	}

	const { loading, data } = useQuery(CLIENT_VERSION_PERSISTED_QUERIES, {
		variables: { clientVersionId: selectedVersion },
	});

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data) {
		return <div style={{ padding: '10px' }}>No queries found</div>;
	}

	return (
		<div style={{ padding: 10 }}>
			{data?.persistedQueries.length > 0 && (
				<strong>Persisted Queries</strong>
			)}
			{data?.persistedQueries.map((pq) => {
				return (
					<div key={pq.key}>
						<PersistedQuery key={pq.key} query={pq} />
					</div>
				);
			})}
		</div>
	);
};

export default ClientPersistedQueries;
