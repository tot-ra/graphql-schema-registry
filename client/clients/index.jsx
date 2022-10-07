// eslint-disable-next-line
import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import SpinnerCenter from '../components/SpinnerCenter';
import { CLIENTS_LIST } from '../utils/queries';
import { ColumnPanel } from '../components/styled';
import ClientVersions from './versions';
import ClientPersistedQueries from './clientPersistedQueries';
import Info from '../components/Info';

export default function Clients() {
	const { loading, data } = useQuery(CLIENTS_LIST);

	const [selectedClient, setSelectedClient] = useState(null);
	const [selectedVersion, setSelectedVersion] = useState(null);

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data || data.clients.length === 0) {
		return (
			<Info>
				No clients found. Use gql-schema-registry-worker to process
				queries from KAFKA_QUERIES_TOPIC
			</Info>
		);
	}

	const clients = data.clients.map((client) => {
		return (
			<ListItem
				selected={selectedClient === client.name}
				key={client.name}
				onClick={() => {
					setSelectedClient(client.name);
				}}
			>
				<ListItemText primary={client.name} />
				<ListItemIcon>
					<ChevronRightIcon />
				</ListItemIcon>
			</ListItem>
		);
	});

	return (
		<Router basename="/clients">
			<div style={{ display: 'flex' }}>
				<List
					component="nav"
					style={{ borderRight: '1px solid #eeeeee' }}
				>
					{clients}
				</List>

				<ColumnPanel
					all="m"
					style={{ borderRight: '1px solid #eeeeee' }}
				>
					<ClientVersions
						clients={data.clients}
						selectedClient={selectedClient}
						selectedVersion={selectedVersion}
						setSelectedVersion={setSelectedVersion}
					/>
				</ColumnPanel>

				<div style={{ flexGrow: 1 }}>
					<ClientPersistedQueries selectedVersion={selectedVersion} />
				</div>
			</div>
		</Router>
	);
}
