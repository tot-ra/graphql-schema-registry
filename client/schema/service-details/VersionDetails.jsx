import React, { useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab } from '@material-ui/core';
import TabPanel from '../../components/TabPanel';

import { useQuery } from '@apollo/client';
import { useRouteMatch } from 'react-router-dom';
import {
	Container,
	VersionHeader,
	VersionHeaderTitle,
	VersionHeaderTime,
	VersionHeaderUrl,
} from '../styled';
import CallMergeIcon from '@material-ui/icons/CallMerge';

import { SCHEMA_DETAILS } from '../../utils/queries';
import { format } from 'date-fns';
import SourceCodeWithHighlightAndCopy from '../../components/SourceCodeWithHighlightAndCopy';

import DeactivateButton from './DeactivateSchemaButton';
import CodeDiff from './CodeDiff';

const VersionDetails = () => {
	const [revealed, setRevealed] = useState(null);
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onClick = () => setRevealed((revealed) => !revealed);

	const schemaId = useSchemaParam();
	const { data, loading } = useQuery(SCHEMA_DETAILS, {
		variables: { schemaId },
		skip: !schemaId,
	});

	if (loading || !data) {
		return null;
	}

	const { id, addedTime, typeDefs, previousSchema, containers } = data.schema;
	const addedTimestamp = new Date(addedTime);
	const url = data.schema.service.url;

	let urlInfo;
	if (url) {
		urlInfo = <VersionHeaderUrl>URL: {url}</VersionHeaderUrl>;
	}

	const oldCode = previousSchema ? previousSchema.typeDefs : '';

	let commitButton;

	const commitLink = data.schema.containers
		? data.schema.containers[0]?.commitLink
		: '';

	if (commitLink) {
		commitButton = (
			<Button size={'small'} href={data.schema.containers[0].commitLink}>
				<CallMergeIcon /> Check commit
			</Button>
		);
	}

	return (
		<Container>
			<div>
				<VersionHeader>
					<div>
						<VersionHeaderTitle noMargin>
							Schema #{id}
						</VersionHeaderTitle>
						<VersionHeaderTime>
							Added{' '}
							{format(addedTimestamp, 'HH:mm, d MMMM yyyy (z)', {
								timeZone: 'UTC',
							})}
						</VersionHeaderTime>
						{urlInfo}
					</div>
					<div>
						<ButtonGroup>
							<DeactivateButton schema={data.schema} />
							{commitButton}
						</ButtonGroup>
					</div>
				</VersionHeader>

				<Tabs
					value={value}
					onChange={handleChange}
					aria-label="simple tabs example"
				>
					<Tab label="Diff with previous" />
					<Tab label="Definition" />
					<Tab label={`Containers (${data.schema.containerCount})`} />
				</Tabs>
				<TabPanel value={value} index={0}>
					<CodeDiff oldCode={oldCode} newCode={typeDefs} />
				</TabPanel>
				<TabPanel value={value} index={1}>
					<SourceCodeWithHighlightAndCopy
						revealed={revealed}
						onClick={onClick}
						query={typeDefs}
						lines="35"
					/>
				</TabPanel>
				<TabPanel value={value} index={2}>
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
												<a href={row.commitLink}>
													github
												</a>
											</td>
										</tr>
									);
								}
							})}
						</tbody>
					</table>
				</TabPanel>
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
