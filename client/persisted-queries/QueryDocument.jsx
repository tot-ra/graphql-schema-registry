import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TypeDefs from '../components/TypeDefs';
import { RelativeWrapper, CopyButton, RevealQuery } from './styled';
import { splitQuery } from '../utils';
import { useClipboard } from '../utils/useClipboard';

const QueryDocument = ({ query, revealed, onClick, lines = 4 }) => {
	const [copied, updateClipboard] = useClipboard();

	const onCopy = (e) => {
		e.stopPropagation();
		updateClipboard(query);
	};

	return (
		<RelativeWrapper onClick={revealed ? null : onClick}>
			{copied ? (
				<CopyButton>
					<CheckIcon />
					<span>Copied</span>
				</CopyButton>
			) : (
				<CopyButton onClick={onCopy}>
					<FilterNoneIcon />
					<span>Copy</span>
				</CopyButton>
			)}

			<TypeDefs code={revealed ? query : splitQuery(query, lines)} />
			<RevealQuery>{revealed ? null : <ExpandMoreIcon />}</RevealQuery>
		</RelativeWrapper>
	);
};

export default QueryDocument;
