import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SourceCodeWithHighlight from './SourceCodeWithHighlight';
import { RelativeWrapper, CopyButton, RevealQuery } from './styled';
import { splitQuery } from '../utils';
import { useClipboard } from '../utils/useClipboard';

const SourceCodeWithHighlightAndCopy = ({ query, revealed, onClick, lines = 4 }) => {
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

			<SourceCodeWithHighlight code={revealed ? query : splitQuery(query, lines)} />
			<RevealQuery>{revealed ? null : <ExpandMoreIcon />}</RevealQuery>
		</RelativeWrapper>
	);
};

export default SourceCodeWithHighlightAndCopy;
