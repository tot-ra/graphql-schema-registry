import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { TypeInstanceStatsOutput } from '../../utils/queries';
import { InstanceStatsClientVersionsTable } from './InstanceStatsClientVersionsTable';
import { CommonContainer } from './shared';

const Container = styled(CommonContainer)`
	h4 {
		margin: 0;
		font-size: 1rem;
	}

	display: grid;
	row-gap: 0.7rem;
`;

type InstanceStatsTableProps = {
	client: TypeInstanceStatsOutput['getUsageTrack'][0]['client'];
};

export const InstanceStatsClient = ({ client }: InstanceStatsTableProps) => (
	<Container as="li">
		<Typography variant="h5" component="h4">
			{client.name}
		</Typography>
		<InstanceStatsClientVersionsTable versions={client.versions} />
	</Container>
);
