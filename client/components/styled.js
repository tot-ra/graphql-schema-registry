import styled from 'styled-components';
import { Button } from '@material-ui/core';
import { colors, elevations } from '../utils';

export const EntryPanel = styled.div`
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
	padding: 10px;
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
`;

export const FlexCenter = styled.div`
	display: flex;
	justify-content: center;
	padding: 24px;
`;

export const OverflowScroll = styled.div`
	overflow: auto;

	& > pre {
		margin: 0;
	}
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
	z-index: 2;
`;

export const ColumnPanel = styled.div`
	min-width: 170px;
	flex-shrink: 0;
`;

export const FlexRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	overflow: hidden;
	height: 100%;
	justify-content: space-between;
`;
