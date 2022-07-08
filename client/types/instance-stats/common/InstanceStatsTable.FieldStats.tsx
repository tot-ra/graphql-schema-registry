import { useQuery } from '@apollo/client';
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
} from '@material-ui/core';
import styled, { css } from 'styled-components';
import { useDateRangeSelector } from '../../../components/DateRangeSelector.Context';
import { ErrorRetry } from '../../../components/ErrorRetry';
import useMinimumTime from '../../../shared/useMinimumTime';
import {
	TypeInstanceObjectFieldStatsOutput,
	TypeInstanceObjectFieldStatsVars,
	TYPE_INSTANCE_OBJECT_FIELD_STATS,
} from '../../../utils/queries';
import { InstanceStatsTableFieldStatsSkeleton } from './InstanceStatsTable.FieldStats.Skeleton';
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

export const UL = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
	display: flex;
	flex-direction: column;
	row-gap: 2rem;
`;

export const LI = styled.li`
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
	id: number;
};

const TableComponent = getInnerInstanceStatsTable(true);

export const InstanceStatsTableFieldStats = ({
	id,
}: InstanceStatsTableFieldStatsProps) => {
	const {
		range: { from, to },
	} = useDateRangeSelector();

	const { loading, error, data, refetch } = useQuery<
		TypeInstanceObjectFieldStatsOutput,
		TypeInstanceObjectFieldStatsVars
	>(TYPE_INSTANCE_OBJECT_FIELD_STATS, {
		variables: {
			id,
			startDate: from,
			endDate: to,
		},
		fetchPolicy: 'no-cache',
	});

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return <InstanceStatsTableFieldStatsSkeleton />;
	}

	if (error || !data) {
		return (
			<Container withPadding>
				<ErrorRetry onRetry={refetch} />
			</Container>
		);
	}

	const { getFieldUsageTrack = [] } = data;

	return (
		<Container>
			<UL>
				{getFieldUsageTrack.map(({ client: { name, versions } }) => (
					<LI key={name}>
						<CommonPadding>
							<Typography variant="caption" component="h5">
								{name}
							</Typography>
						</CommonPadding>
						<Table component={TableComponent}>
							<TableBody>
								{versions.map(({ id, execution }) => (
									<TableRow key={id}>
										<TableCell component="td" scope="row">
											<CommonPadding>{id}</CommonPadding>
										</TableCell>
										<TableCell component="td" scope="row">
											{execution?.total ?? 0}
										</TableCell>
										<TableCell component="td" scope="row">
											{execution?.success ?? 0}
										</TableCell>
										<TableCell component="td" scope="row">
											{execution?.error ?? 0}
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
