import React from 'react';
import styled, { css } from 'styled-components';
import { colors } from '../utils';

export const FlexRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	overflow: hidden;
	height: 100%;
	justify-content: space-between;
`;

type InnerTableProps = {
	columnsWidth: number[];
};

export const InnerTable = styled.table<InnerTableProps>`
	width: 100%;
	table-layout: fixed;

	tbody th:nth-child(2),
	tbody td:nth-child(2) {
		text-align: justify;
		color: ${colors.black.hex32};
	}

	${({ columnsWidth }) =>
		columnsWidth.map(
			(columnWidth, index) => css`
				th:nth-child(${index + 1}),
				td:nth-child(${index + 1}) {
					width: ${columnWidth}%;
				}
			`
		)}
`;

export const InnerTableTwoColumns = React.forwardRef<
	HTMLTableElement,
	React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLTableElement>,
		HTMLTableElement
	>
>(function InnerTableFourColumns(props, ref) {
	return <InnerTable columnsWidth={[55, 45]} {...props} ref={ref} />;
});

export const InnerTableThreeColumns = React.forwardRef<
	HTMLTableElement,
	React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLTableElement>,
		HTMLTableElement
	>
>(function InnerTableFourColumns(props, ref) {
	return <InnerTable columnsWidth={[25, 60, 15]} {...props} ref={ref} />;
});

export const InnerTableFourColumns = React.forwardRef<
	HTMLTableElement,
	React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLTableElement>,
		HTMLTableElement
	>
>(function InnerTableFourColumns(props, ref) {
	return <InnerTable columnsWidth={[30, 50, 15, 5]} {...props} ref={ref} />;
});

export const NormalizedLabel = styled.span`
	display: inline-block;
	text-transform: lowercase;
	&::first-letter {
		text-transform: uppercase;
	}
`;
