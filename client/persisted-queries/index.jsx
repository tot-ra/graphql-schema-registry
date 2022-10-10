// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import React from 'react';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../components/SpinnerCenter';
import PersistedQuery from './PersistedQuery';

import { PERSISTED_QUERIES } from '../utils/queries';
import Info from '../components/Info';

export default function PersistedQueries() {
	const { loading, data } = useQuery(PERSISTED_QUERIES);

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data || !data.persistedQueries.length) {
		return (
			<Info>
				No persisted queries found. Integrate gateway to publish
				persisted query to schema-registry API
			</Info>
		);
	}

	return (
		<div>
			{data.persistedQueries.map((query) => (
				<PersistedQuery key={query.key} query={query} />
			))}
		</div>
	);
}
