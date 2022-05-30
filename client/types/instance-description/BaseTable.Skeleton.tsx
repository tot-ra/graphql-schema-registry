import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ReactNode } from 'react';
import { InnerTableTwoColumns } from '../../shared/styled';

type BaseTableSkeletonProps = {
	children: ReactNode;
};

export const BaseTableSkeleton = ({ children }: BaseTableSkeletonProps) => (
	<TableContainer component={Paper}>
		<Table component={InnerTableTwoColumns}>
			<TableHead>
				<TableRow>
					<TableCell>
						<Skeleton variant="rect" width="40%" height={15} />
					</TableCell>
					<TableCell />
				</TableRow>
			</TableHead>
			<TableBody>{children}</TableBody>
		</Table>
	</TableContainer>
);
