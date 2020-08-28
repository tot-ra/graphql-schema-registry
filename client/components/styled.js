import styled from 'styled-components';
import { Spacing } from '@pipedrive/convention-ui-react';
import Container from '@material-ui/core/Container';
import { colors, elevations } from '../utils';

export const PluginWrapper = styled.div`
	--bo-sidebar-width: 64px;
	max-width: calc(100vw - var(--bo-sidebar-width));
	box-sizing: border-box;
`;

export const EntryPanel = styled(Container)`
	transition: 0.2s ease-in;
	box-shadow: ${elevations[2]};
	cursor: ${({ onClick }) => onClick && 'pointer'};
	margin-bottom: 16px;
	background-color: ${({ selected }) => selected && colors.green.hex};
	color: ${({ selected }) => selected && 'white'};

	&.deleted {
		background-color: #cccccc;
	}
	&:hover {
		box-shadow: ${elevations[3]};
	}
	&:active {
		box-shadow: ${elevations[1]};
	}
`;

export const EntryName = styled.h3`
	font-weight: 400;
	margin: 0;
	& > span {
		font-weight: normal;
	}
`;

export const EntryGrid = styled.div`
	display: flex;
	align-items: center;
	flex-flow: row nowrap;
	& > :first-child {
		flex: 2;
	}

	.cui4-icon {
		margin: 0 5px;
	}
`;

export const FlexCenter = styled.div`
	display: flex;
	justify-content: center;
	padding: 24px;
`;

export const OverflowScroll = styled.div`
	overflow: auto;
`;
