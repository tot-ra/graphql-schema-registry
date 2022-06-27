import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { CommonLink } from '../../../components/Link';
import { TypeInstanceOperationStatsOutput } from '../../../utils/queries';
import { InstanceStatsTable } from '../common/InstanceStatsTable';
import { CommonContainer } from '../shared';

const Container = styled(CommonContainer)`
	h4 {
		margin: 0;
		font-size: 1rem;
	}

	display: grid;
	row-gap: 0.7rem;
`;

export const List = styled(CommonContainer)`
	h5 {
		margin: 0;
		font-size: 0.8rem;
		color: #737373;
	}
	padding-inline-start: 0;
	list-style: none;
`;

type InstanceStatsTableProps = {
	client: TypeInstanceOperationStatsOutput['getOperationUsageTrack'][0]['client'];
};

export const InstanceStatsClient = ({
	client: { name, versions },
}: InstanceStatsTableProps) => (
	<Container as="li">
		<Typography variant="h5" component="h4">
			{name}
		</Typography>
		<List as="ul">
			{versions.map((version) => (
				<InstanceStatsTable
					as="li"
					headerLabel="Operation"
					key={version.id}
					title={version.id}
					showUsageDetail={false}
					items={version.operations.map((operation) => ({
						id: operation.name,
						name: operation.name,
						label: (
							<CommonLink
								to={`/schemas/${operation.name}/${version.id}`}
							>
								{operation.name}
							</CommonLink>
						),
						executions: operation.executions,
					}))}
				/>
			))}
		</List>
	</Container>
);
