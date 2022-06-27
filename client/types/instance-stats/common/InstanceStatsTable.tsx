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
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CommonContainer } from '../shared';
import { InstanceStatsTableRow } from './InstanceStatsTable.Row';
import { getInnerInstanceStatsTable } from './util';

type InstanceStatsTableProps = {
	title?: string;
	as?: Parameters<ReturnType<typeof styled['html']>>['0']['as'];
	headerLabel: string;
	items: {
		id: number | string;
		name: string;
		label: React.ReactNode;
		executions?: {
			success: number;
			error: number;
			total: number;
		};
	}[];
	showUsageDetail: boolean;
};

export const InstanceStatsTable = ({
	title,
	items,
	headerLabel,
	as,
	showUsageDetail,
}: InstanceStatsTableProps) => {
	const TableComponent = useMemo(
		() => getInnerInstanceStatsTable(showUsageDetail),
		[showUsageDetail]
	);

	return (
		<CommonContainer as={as}>
			{title && (
				<Typography variant="h6" component="h5">
					{title}
				</Typography>
			)}
			<TableContainer component={Paper}>
				<Table component={TableComponent}>
					<TableHead>
						<TableRow>
							<TableCell>{headerLabel}</TableCell>
							<TableCell>Total</TableCell>
							<TableCell>Success</TableCell>
							<TableCell>Error</TableCell>
							{showUsageDetail && <TableCell />}
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map(({ id, executions, label, name }) => (
							<InstanceStatsTableRow
								key={name}
								id={id}
								label={label}
								name={name}
								executions={executions}
								showUsageDetail={showUsageDetail}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</CommonContainer>
	);
};
