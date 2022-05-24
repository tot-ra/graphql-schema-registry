import { TableCell, TableRow } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { BaseTableSkeleton } from '../instance-description/BaseTable.Skeleton';
import { Container } from './InstanceStatsClientVersionsTable';

type InstanceStatsClientVersionsTableSkeletonProps = {
	amount?: number;
	versions?: number;
};

export const InstanceStatsClientVersionsTableSkeleton = ({
	amount = 1,
	versions = 2,
}: InstanceStatsClientVersionsTableSkeletonProps) => (
	<Container>
		{Array(amount)
			.fill(null)
			.map((_, index) => (
				<React.Fragment key={index}>
					<Skeleton variant="rect" width="30%" height={15} />
					<BaseTableSkeleton>
						{React.Children.toArray(
							Array(versions)
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
				</React.Fragment>
			))}
	</Container>
);
