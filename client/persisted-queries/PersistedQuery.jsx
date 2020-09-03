import React, { useState } from 'react';

import { EntryPanel } from '../components/styled';
import QueryName from './QueryName';
import SourceCodeWithHighlightAndCopy from '../components/SourceCodeWithHighlightAndCopy';

const PersistedQuery = ({ query }) => {
	const [revealed, setRevealed] = useState(null);
	const onClick = () => setRevealed((revealed) => !revealed);

	return (
		<EntryPanel>
			<QueryName revealed={revealed} onClick={onClick} entry={query} />
			<SourceCodeWithHighlightAndCopy
				revealed={revealed}
				onClick={onClick}
				query={query.query}
			/>
		</EntryPanel>
	);
};

export default PersistedQuery;
