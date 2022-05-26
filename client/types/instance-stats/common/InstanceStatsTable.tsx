import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { InnerTable } from '../../../shared/styled';
import { CommonContainer } from '../shared';

const InnerInstanceStatsTable = React.forwardRef<
	HTMLTableElement,
	React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLTableElement>,
		HTMLTableElement
	>
>(function InnerTableFourColumns(props, ref) {
	return <InnerTable columnsWidth={[55, 15, 15, 15]} {...props} ref={ref} />;
});

type InstanceStatsTableProps = {
	title?: string;
	as?: Parameters<ReturnType<typeof styled['html']>>['0']['as'];
	headerLabel: string;
	items: {
		id: React.Key;
		label: React.ReactNode;
		executions: {
			success: number;
			error: number;
			total: number;
		};
	}[];
};

export const InstanceStatsTable = ({
	title,
	items,
	headerLabel,
	as,
}: InstanceStatsTableProps) => (
	<CommonContainer as={as}>
		{title && (
			<Typography variant="h6" component="h5">
				{title}
			</Typography>
		)}
		<TableContainer component={Paper}>
			<Table component={InnerInstanceStatsTable}>
				<TableHead>
					<TableRow>
						<TableCell>{headerLabel}</TableCell>
						<TableCell>Total</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Error</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{items.map(({ id, executions, label }) => (
						<TableRow key={id}>
							<TableCell component="th" scope="row">
								{label}
							</TableCell>
							<TableCell component="th" scope="row">
								{executions.total}
							</TableCell>
							<TableCell component="th" scope="row">
								{executions.success}
							</TableCell>
							<TableCell component="th" scope="row">
								{executions.error}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	</CommonContainer>
);
