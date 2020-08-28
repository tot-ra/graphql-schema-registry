import styled from 'styled-components';
import Button from '@material-ui/core/Button';

import { EntryGrid } from '../components/styled';

export const DocumentQueryEntry = styled(EntryGrid)`
	cursor: pointer;
`;

export const RevealQuery = styled.div`
	position: absolute;
	bottom: 15px;
	left: 0;
	right: 0;
	text-align: center;
	transition: transform 0.2s;
	cursor: pointer;
`;

export const RelativeWrapper = styled.div`
	position: relative;

	&:hover ${RevealQuery} {
		transform: translateY(4px);
	}
`;

export const CopyButton = styled(Button)`
	position: absolute;
	top: 16px;
	right: 8px;
	width: 100px;
	z-index: 2;
`;
