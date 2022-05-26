import { TableCell, TableRow } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { BaseTableSkeleton } from '../../instance-description/BaseTable.Skeleton';
import { CommonContainer } from '../shared';

type InstanceStatsSkeletonProps = {
	hideTitle?: boolean;
	rows?: number;
};

export const InstanceStatsTableSkeleton = ({
	hideTitle = false,
	rows = 2,
}: InstanceStatsSkeletonProps) => {
	const table = (
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
									width="40%"
									height={20}
								/>
							</TableCell>
						</TableRow>
					))
			)}
		</BaseTableSkeleton>
	);

	if (hideTitle) {
		return table;
	}

	return (
		<CommonContainer>
			<Skeleton variant="rect" width="30%" height={15} />
			{table}
		</CommonContainer>
	);
};
