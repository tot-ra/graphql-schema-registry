import styled, { css } from 'styled-components';
import TextField from '@material-ui/core/TextField';
import { colors } from '../utils';

export const FlexRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	overflow: hidden;
	height: 100%;
`;

export const ColumnPanel = styled.div`
	min-width: 200px;
	flex-shrink: 0;
	border-right: 1px solid ${colors.black.hex12};
`;

const headerStyle = css`
	height: 57px;
	box-sizing: border-box;
	border-bottom: 1px solid ${colors.black.hex12};
`;

export const FilterInput = styled(TextField)`
	transition: 0.2s;
	margin: -16px -16px 16px;
	${headerStyle}
	&:focus-within {
		border-bottom-color: ${colors.black.hex64};
	}
	&:hover {
		border-bottom-color: ${colors.black.hex32};
	}
	input[type='text'] {
		padding-top: 12px;
		padding-bottom: 12px;
		margin: 8px 0;
		height: 40px;
		border: none !important;
		box-shadow: none !important;
	}
`;

export const Container = styled.section`
	flex: 100%;
	overflow: hidden;
`;

export const ServiceDetailsHeader = styled.header`
	display: flex;
	align-items: center;
	${headerStyle}
`;

export const Heading = styled.h2`
	font-weight: 400;
	margin: ${({ noMargin }) => (noMargin ? 0 : '0 16px')};
`;

export const SelectServiceGuide = styled.h1`
	text-align: center;
	margin: 64px 16px 16px;
	font-weight: 400;
`;

export const VersionRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	& > :last-child {
		color: ${({ selected }) => (selected ? 'white' : colors.black.hex32)};
	}
`;

export const VersionTag = styled.p`
	padding: 0;
	margin: 0;
	font-weight: 600;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;
