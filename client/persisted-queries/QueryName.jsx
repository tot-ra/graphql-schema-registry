import React from 'react';
// import { Icon } from '@pipedrive/convention-ui-react';

import { EntryName } from '../components/styled';

import { DocumentQueryEntry } from './styled';

const QueryName = ({ entry, revealed, onClick }) => {
	return (
		<DocumentQueryEntry onClick={onClick}>
			<div>
				<EntryName>{entry.key}</EntryName>
				<div>{entry.addedTime}</div>
			</div>
			<Icon icon={revealed ? 'arrow-up' : 'arrow-down'} />
		</DocumentQueryEntry>
	);
};

export default QueryName;
