import { useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab } from '@material-ui/core';

import { useQuery } from '@apollo/client';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
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
import UsageTab from './UsageTab';
import ContainersTab from './ContainersTab';

// eslint-disable-next-line complexity
export default function VersionDetails() {
	const history = useHistory();
	const { serviceName, schemaId, subtab, selectedEntity, selectedProperty } =
		useSchemaParam();

	const [revealed, setRevealed] = useState(null);
	const [activeTab, setTab] = useState(subtab ? subtab : 'sdl');
	let selectedTab = 0;

	const handleChange = (event, newValue) => {
		selectedTab = newValue;
	};

	const onClick = () => setRevealed((revealed) => !revealed);

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
	let panelContent = '';
	const oldCode = previousSchema ? previousSchema.typeDefs : '';

	switch (activeTab) {
		case 'diff':
			selectedTab = 1;
			panelContent = <CodeDiff oldCode={oldCode} newCode={typeDefs} />;
			break;
		case 'sdl':
			selectedTab = 0;
			panelContent = (
				<SourceCodeWithHighlightAndCopy
					revealed={revealed}
					onClick={onClick}
					query={typeDefs}
					lines="35"
				/>
			);
			break;
		case 'containers':
			selectedTab = 3;
			panelContent = <ContainersTab containers={containers} />;
			break;
		case 'usage':
			selectedTab = 2;
			panelContent = <UsageTab schemaId={data.schema.id} />;
			break;
		default:
			break;
	}

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

	const selectedEntityUrlPath = selectedEntity
		? `/${selectedEntity}/${selectedProperty}`
		: '';

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
					value={selectedTab}
					onChange={handleChange}
					aria-label="simple tabs example"
				>
					<Tab
						label="SDL"
						onClick={() => {
							history.push(`/${serviceName}/${schemaId}/sdl`);
							setTab('sdl');
						}}
						selected={activeTab === 'sdl'}
					/>

					<Tab
						label="Diff"
						onClick={() => {
							history.push(`/${serviceName}/${schemaId}/diff`);
							setTab('diff');
						}}
						selected={activeTab === 'diff'}
					/>

					<Tab
						label="Usage"
						onClick={() => {
							history.push(
								`/${serviceName}/${schemaId}/usage${selectedEntityUrlPath}`
							);
							setTab('usage');
						}}
						selected={activeTab === 'usage'}
					/>

					<Tab
						label={`Containers (${data.schema.containerCount})`}
						onClick={() => {
							history.push(
								`/${serviceName}/${schemaId}/containers`
							);
							setTab('containers');
						}}
						selected={activeTab === 'containers'}
					/>
				</Tabs>
				{panelContent}
			</div>
		</Container>
	);
}

function useSchemaParam() {
	const match = useRouteMatch(
		'/:serviceName/:schemaId/:subtab/:selectedEntity?/:selectedProperty?'
	);
	const schemaId = match?.params?.schemaId;
	const subtab = match?.params?.subtab;
	const selectedEntity = match?.params?.selectedEntity;
	const selectedProperty = match?.params?.selectedProperty;

	const { serviceName } = useParams();

	return {
		serviceName,
		subtab,
		schemaId: schemaId ? parseInt(schemaId, 10) : null,
		selectedEntity,
		selectedProperty,
	};
}
