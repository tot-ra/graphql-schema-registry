import {
	List,
	ListItem,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { CommonLink } from '../../components/Link';
import { InnerTableTwoColumns } from '../../shared/styled';
import { TypeInstanceStatsOutput } from '../../utils/queries';
import { CommonContainer } from './shared';

export const Container = styled(CommonContainer)`
	h5 {
		margin: 0;
		font-size: 0.8rem;
		color: #737373;
	}
`;

type InstanceStatsClientVersionsTableProps = {
	versions: TypeInstanceStatsOutput['getUsageTrack'][0]['client']['versions'];
};

export const InstanceStatsClientVersionsTable = ({
	versions,
}: InstanceStatsClientVersionsTableProps) => (
	<Container>
		{versions.map((version) => (
			<React.Fragment key={version.id}>
				<Typography variant="h6" component="h5">
					{version.id}
				</Typography>
				<TableContainer component={Paper}>
					<Table component={InnerTableTwoColumns}>
						<TableHead>
							<TableRow>
								<TableCell>Operation</TableCell>
								<TableCell>Executions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{version.operations.map((operation) => (
								<TableRow key={operation.name}>
									<TableCell component="th" scope="row">
										<CommonLink
											to={`/schemas/${operation.name}/${version.id}`}
										>
											{operation.name}
										</CommonLink>
										<List>
											{operation.fields.map((field) => (
												<ListItem key={field.id}>
													{field.name}
												</ListItem>
											))}
										</List>
									</TableCell>
									<TableCell component="th" scope="row">
										{operation.executions}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</React.Fragment>
		))}
	</Container>
);
