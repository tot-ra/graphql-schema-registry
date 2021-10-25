import styled, { css } from 'styled-components';
import TextField from '@material-ui/core/TextField';
import { colors } from '../utils';

export const FlexRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	overflow: hidden;
	height: 100%;
	justify-content: space-between;
`;

export const ServiceListColumnEmpty = styled.div`
	padding: 20px;
	min-width: 300px;
	flex-shrink: 0;
	border-right: 1px solid ${colors.black.hex256};

	p {
		margin: 5px;
	}
`;

export const ServiceListColumn = styled.div`
	min-width: 150px;
	flex-shrink: 0;
	border-right: 1px solid ${colors.black.hex256};
`;

export const SchemaListColumn = styled.div`
	min-width: 250px;
	flex-shrink: 0;
	border-right: 1px solid ${colors.black.hex256};
`;

export const Container = styled.section`
	flex: 100%;
	overflow: hidden;
`;
export const VersionHeaderTitle = styled.h2`
	font-weight: 400;
	margin: ${({ noMargin }) => (noMargin ? 0 : '0 16px')};
`;
export const VersionHeaderTime = styled.div`
	color: gray;
`;
export const VersionHeaderUrl = styled.div`
	color: gray;
`;

export const SelectServiceGuide = styled.h1`
	text-align: center;
	margin: 64px 16px 16px;
	font-weight: 400;
`;

export const VersionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 20px;
`;
export const VersionRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	& > :last-child {
		color: ${colors.black.hex64};
	}
`;

export const VersionTag = styled.div`
	padding: 0;
	margin: 0;
	font-weight: 600;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

export const VersionChars = styled.div`
	opacity: 0.5;
	font-weight: 300;
`;
export const VersionCharsPositive = styled.div`
	color: ${({ selected }) => (selected ? 'green' : 'green')};
`;
export const VersionCharsNegative = styled.div`
	color: ${({ selected }) => (selected ? 'red' : 'red')};
`;
