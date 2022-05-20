import styled from 'styled-components';
import { colors } from '../utils';

export const FlexRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	overflow: hidden;
	height: 100%;
	justify-content: space-between;
`;

export const MainViewContainer = styled.main`
	overflow: auto;
	padding: 2rem;
	display: grid;
	grid-template-rows: auto 1fr;
	row-gap: 2rem;
	background-color: #f5f5f8;
`;

export const InnerTableTwoColumns = styled.table`
	width: 100%;
	table-layout: fixed;

	th:first-child {
		width: 55%;
	}

	th:last-child,
	td:last-child {
		width: 45%;
		color: ${colors.black.hex32};
	}
`;

export const InnerTableThreeColumns = styled.table`
	width: 100%;
	table-layout: fixed;

	th:first-child {
		width: 25%;
	}

	th:nth-child(2),
	td:nth-child(2) {
		width: 60%;
		text-align: justify;
		color: ${colors.black.hex32};
	}

	th:last-child {
		width: 15%;
	}
`;

export const InnerTableFourColumns = styled.table`
	width: 100%;
	table-layout: fixed;

	th:first-child {
		width: 25%;
	}

	th:nth-child(2),
	td:nth-child(2) {
		width: 50%;
		text-align: justify;
		color: ${colors.black.hex32};
	}

	th:nth-child(3) {
		width: 15%;
	}

	th:last-child {
		width: 10%;
	}
`;

export const NormalizedLabel = styled.span`
	display: inline-block;
	text-transform: lowercase;
	&::first-letter {
		text-transform: uppercase;
	}
`;
