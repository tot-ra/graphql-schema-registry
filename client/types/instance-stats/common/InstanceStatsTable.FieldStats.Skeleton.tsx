import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import {
	CommonPadding,
	Container,
	LI,
	UL,
} from './InstanceStatsTable.FieldStats';
import { getInnerInstanceStatsTable } from './util';

const TableComponent = getInnerInstanceStatsTable(true);

export const InstanceStatsTableFieldStatsSkeleton = () => {
	return (
		<Container>
			<UL>
				{Array(2)
					.fill(null)
					.map((_, index) => index)
					.map((key) => (
						<LI key={key}>
							<CommonPadding>
								<Skeleton
									variant="rect"
									width="15%"
									height={15}
								/>
							</CommonPadding>
							<Table component={TableComponent}>
								<TableBody>
									{Array(2)
										.fill(null)
										.map((_, index) => index)
										.map((id) => (
											<TableRow key={id}>
												<TableCell
													component="td"
													scope="row"
												>
													<CommonPadding>
														<Skeleton
															variant="rect"
															width="15%"
															height={15}
														/>
													</CommonPadding>
												</TableCell>
												<TableCell
													component="td"
													scope="row"
												>
													<Skeleton
														variant="rect"
														width="15%"
														height={15}
													/>
												</TableCell>
												<TableCell
													component="td"
													scope="row"
												>
													<Skeleton
														variant="rect"
														width="15%"
														height={15}
													/>{' '}
												</TableCell>
												<TableCell
													component="td"
													scope="row"
												>
													<Skeleton
														variant="rect"
														width="15%"
														height={15}
													/>{' '}
												</TableCell>
												<TableCell />
											</TableRow>
										))}
								</TableBody>
							</Table>
						</LI>
					))}
			</UL>
		</Container>
	);
};
