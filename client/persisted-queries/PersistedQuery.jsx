import React, { useState } from 'react';

import { EntryPanel } from '../components/styled';
import QueryName from './QueryName';
import QueryDocument from './QueryDocument';

const PersistedQuery = ({ query }) => {
	const [revealed, setRevealed] = useState(null);
	const onClick = () => setRevealed((revealed) => !revealed);

	return (
		<EntryPanel>
			<QueryName revealed={revealed} onClick={onClick} entry={query} />
			<QueryDocument revealed={revealed} onClick={onClick} query={query.query} />
		</EntryPanel>
	);
};

export default PersistedQuery;
