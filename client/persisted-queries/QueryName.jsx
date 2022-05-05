import { EntryName } from '../components/styled';

import { DocumentQueryEntry } from './styled';

const QueryName = ({ entry, onClick }) => {
	return (
		<DocumentQueryEntry onClick={onClick}>
			<div>
				<EntryName>{entry.key}</EntryName>
				<div>{entry.addedTime}</div>
			</div>
		</DocumentQueryEntry>
	);
};

export default QueryName;
