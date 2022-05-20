import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';
import { ReactNode } from 'react';
import {
	InnerTableThreeColumns,
	InnerTableTwoColumns,
} from '../../shared/styled';

type BaseTableProps = {
	label: string;
	children: ReactNode;
	columns?: '2' | '3';
};

export const BaseTable = ({
	label,
	children,
	columns = '2',
}: BaseTableProps) => (
	<TableContainer component={Paper}>
		<Table
			component={
				columns === '2' ? InnerTableTwoColumns : InnerTableThreeColumns
			}
		>
			<TableHead>
				<TableRow>
					<TableCell>{label}</TableCell>
					<TableCell />
					{columns === '3' && <TableCell>Schemas</TableCell>}
				</TableRow>
			</TableHead>
			<TableBody>{children}</TableBody>
		</Table>
	</TableContainer>
);
