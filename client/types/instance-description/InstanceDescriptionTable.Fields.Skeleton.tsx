import { TableCell, TableRow } from '@material-ui/core';
import React from 'react';
import {
	Container,
	InstanceDescriptionTableTitle,
} from './InstanceDescriptionTable.Common';
import { Skeleton } from '@material-ui/lab';
import { BaseTableSkeleton } from './BaseTable.Skeleton';

type InstanceDescriptionTableFieldsSkeletonProps = {
	rows: number;
};

export const InstanceDescriptionTableFieldsSkeleton = ({
	rows,
}: InstanceDescriptionTableFieldsSkeletonProps) => (
	<Container>
		<InstanceDescriptionTableTitle>
			<Skeleton variant="rect" width="30%" height={20} />
		</InstanceDescriptionTableTitle>
		<BaseTableSkeleton>
			{React.Children.toArray(
				Array(rows)
					.fill(null)
					.map(() => (
						// eslint-disable-next-line react/jsx-key
						<TableRow>
							<TableCell component="th" scope="row">
								<Skeleton
									variant="rect"
									width="40%"
									height={20}
								/>
							</TableCell>
							<TableCell>
								<Skeleton
									variant="rect"
									width="100%"
									height={20}
								/>
							</TableCell>
						</TableRow>
					))
			)}
		</BaseTableSkeleton>
	</Container>
);
