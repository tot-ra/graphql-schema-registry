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
import React, { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { CommonContainer } from '../shared';
import { InstanceStatsTableRow } from './InstanceStatsTable.Row';
import { getInnerInstanceStatsTable } from './util';

export type InstanceStatsItem = {
	id: number | string;
	name: string;
	label: React.ReactNode;
	usageStats?: {
		success: number;
		error: number;
	};
};

type InstanceStatsTableProps = {
	details?: (item: InstanceStatsItem) => ReactNode;
	title?: string;
	as?: Parameters<ReturnType<typeof styled['html']>>['0']['as'];
	headerLabel: string;
	items: InstanceStatsItem[];
};

export const InstanceStatsTable = ({
	details,
	title,
	items,
	headerLabel,
	as,
}: InstanceStatsTableProps) => {
	const TableComponent = useMemo(
		() => getInnerInstanceStatsTable(!!details),
		[details]
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
							{!!details && <TableCell />}
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map((item) => {
							const { label, name, usageStats } = item;
							return (
								<InstanceStatsTableRow
									details={details?.(item)}
									key={name}
									label={label}
									name={name}
									usageStats={usageStats}
								/>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</CommonContainer>
	);
};
