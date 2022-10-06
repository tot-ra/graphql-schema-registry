//eslint-disable-next-line
import React from 'react';
import { formatDistance } from 'date-fns';

import { List, ListItem } from '@material-ui/core';
import { FlexRow, EntryGrid } from '../components/styled';

const Versions = ({
	clients,
	selectedClient,
	selectedVersion,
	setSelectedVersion,
}) => {
	let versions = null;

	if (!selectedClient) {
		return null;
	}

	clients.map((client) => {
		if (selectedClient === client.name && client.versions) {
			versions = client.versions.map((version) => (
				<ListItem
					selected={selectedVersion === version.id}
					key={version.id}
					onClick={() => setSelectedVersion(version.id)}
				>
					<EntryGrid>
						<div style={{ cursor: 'pointer' }}>
							<FlexRow>
								<div>{version.version}</div>
							</FlexRow>
							<div>
								Updated{' '}
								{formatDistance(
									new Date(version.updatedTime),
									new Date(),
									{
										addSuffix: true,
									}
								)}
							</div>
						</div>
					</EntryGrid>
				</ListItem>
			));
		}
	});

	if (!versions) {
		versions = <div>No versions found</div>;
	}

	return <List component="nav">{versions}</List>;
};

export default Versions;
