import React, { useState } from 'react';
import {Button, ButtonGroup} from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';

import { useQuery } from '@apollo/client';
import { useRouteMatch } from 'react-router-dom';
import { Container, VersionRow, Heading } from '../styled';
import CallMergeIcon from '@material-ui/icons/CallMerge';

import { SCHEMA_DETAILS } from '../../utils/queries';
import { format } from 'date-fns';
import { EntryPanel } from '../../components/styled';
import QueryDocument from '../../persisted-queries/QueryDocument';

import DeactivateButton from './DeactivateSchemaButton';
import CodeDiff from './CodeDiff';

const VersionDetails = () => {
	const [revealed, setRevealed] = useState(null);
	const [activeTab, setTab] = useState(1);
	const onClick = () => setRevealed((revealed) => !revealed);

	const schemaId = useSchemaParam();
	const { data, loading } = useQuery(SCHEMA_DETAILS, {
		variables: { schemaId },
		skip: !schemaId
	});

	if (loading || !data) {
		return null;
	}

	const { id, addedTime, typeDefs, previousSchema, containers } = data.schema;
	const addedTimestamp = new Date(addedTime);

	let panelContent = '';

	const oldCode = previousSchema ? previousSchema.typeDefs : '';

	switch (activeTab) {
		case 0:
			panelContent = <CodeDiff oldCode={oldCode} newCode={typeDefs} />;
			break;
		case 1:
			panelContent = (
				<EntryPanel>
					<QueryDocument
						revealed={revealed}
						onClick={onClick}
						query={typeDefs}
						lines="35"
					/>
				</EntryPanel>
			);
			break;
		case 2:
			if (data.schema.containerCount > 0) {
				panelContent = (
					<table width="100%">
						<thead>
							<tr>
								<th width="180">Docker container id</th>
								<th>Time added</th>
								<th>Link</th>
							</tr>
						</thead>
						<tbody>
							{containers.map((row) => {
								if (row.version !== 'latest') {
									return (
										<tr key={row.version}>
											<td>{row.version}</td>
											<td>{row.addedTime}</td>
											<td>
												<a href={row.commitLink}>github</a>
											</td>
										</tr>
									);
								}
							})}
						</tbody>
					</table>
				);
			} else {
				panelContent = <div>No real containers use this schema</div>;
			}

			break;
	}

	let commitButton;

	const commitLink = data.schema.containers ? data.schema.containers[0]?.commitLink : '';

	if (commitLink) {
		commitButton = (
			<Button href={data.schema.containers[0].commitLink}>
				<CallMergeIcon /> Check commit
			</Button>
		);
	}

	return (
		<Container>
			<div>
				<VersionRow>
					<Heading noMargin>Schema #{id}</Heading>

					<ButtonGroup>
						<DeactivateButton schema={data.schema} />
						{commitButton}
					</ButtonGroup>
				</VersionRow>
				<div>
					Added {format(addedTimestamp, 'HH:mm, d MMMM yyyy (z)', { timeZone: 'UTC' })}
				</div>

				<Tabs
					tabs={
						<React.Fragment>
							<Tabs.Tab
								onClick={() => {
									setTab(0);
								}}
								active={activeTab === 0}
							>
								Diff with previous
							</Tabs.Tab>
							<Tabs.Tab
								onClick={() => {
									setTab(1);
								}}
								active={activeTab === 1}
							>
								Definition
							</Tabs.Tab>
							<Tabs.Tab
								onClick={() => {
									setTab(2);
								}}
								active={activeTab === 2}
							>
								{`Containers (${data.schema.containerCount})`}
							</Tabs.Tab>
						</React.Fragment>
					}
				>
					<Container>{panelContent}</Container>
				</Tabs>
			</div>
		</Container>
	);
};

export default VersionDetails;

export function useSchemaParam() {
	const match = useRouteMatch('/:serviceName/:schemaId');
	const schemaId = match?.params?.schemaId;

	return schemaId ? parseInt(schemaId, 10) : null;
}
