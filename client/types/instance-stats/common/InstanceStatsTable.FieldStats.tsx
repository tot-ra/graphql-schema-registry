import {
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
} from '@material-ui/core';
import styled, { css } from 'styled-components';
import { type FieldClient } from '../../../utils/queries';
import { getInnerInstanceStatsTable } from './util';

type ContainerProps = {
	withPadding?: boolean;
};

export const Container = styled.div<ContainerProps>`
	${({ withPadding = false }) =>
		withPadding
			? css`
					padding: 2rem;
			  `
			: css`
					padding: 0;
			  `}
`;

export const Ul = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
	display: flex;
	flex-direction: column;
	row-gap: 2rem;
`;

export const Li = styled.li`
	&:last-child {
		table {
			tr:last-child {
				td,
				th {
					border-bottom: 0;
				}
			}
		}
	}
`;

export const CommonPadding = styled.div`
	padding-left: 2rem;
`;

type InstanceStatsTableFieldStatsProps = {
	clients: FieldClient[];
};

const TableComponent = getInnerInstanceStatsTable(true);

export const InstanceStatsTableFieldStats = ({
	clients,
}: InstanceStatsTableFieldStatsProps) => {
	return (
		<Container>
			<Ul>
				{clients.map(({ clientName, clientVersions }) => {
					const clientVersionsWithoutEmptyValues =
						clientVersions.filter(({ usageStats }) =>
							usageStats?.error === 0 && usageStats?.success === 0
								? false
								: true
						);

					return (
						<Li key={clientName}>
							<CommonPadding>
								<Typography variant="caption" component="h5">
									{clientName}
								</Typography>
							</CommonPadding>
							<Table component={TableComponent}>
								<TableBody>
									{clientVersionsWithoutEmptyValues.map(
										({ clientVersion, usageStats }) => {
											const error =
												usageStats?.error ?? 0;
											const success =
												usageStats?.success ?? 0;
											const total = error + success;

											return (
												<TableRow key={clientVersion}>
													<TableCell
														component="td"
														scope="row"
													>
														<CommonPadding>
															{clientVersion}
														</CommonPadding>
													</TableCell>
													<TableCell
														component="td"
														scope="row"
													>
														{total}
													</TableCell>
													<TableCell
														component="td"
														scope="row"
													>
														{success}
													</TableCell>
													<TableCell
														component="td"
														scope="row"
													>
														{error}
													</TableCell>
													<TableCell />
												</TableRow>
											);
										}
									)}
								</TableBody>
							</Table>
						</Li>
					);
				})}
			</Ul>
		</Container>
	);
};
