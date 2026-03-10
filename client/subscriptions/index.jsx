import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { parse, print } from 'graphql';

import SpinnerCenter from '../components/SpinnerCenter';
import Info from '../components/Info';
import SourceCodeWithHighlight from '../components/SourceCodeWithHighlight';
import {
	SUBSCRIPTION_DEFINITIONS,
	SUBSCRIPTION_SOURCES,
} from '../utils/queries';

function formatDate(value) {
	if (!value) {
		return '';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return String(value);
	}

	return date.toISOString().replace('T', ' ').slice(0, 19);
}

function formatArguments(argumentsList) {
	if (!Array.isArray(argumentsList) || argumentsList.length === 0) {
		return 'none';
	}

	return argumentsList
		.map((arg) => {
			const typeSuffix = arg?.defaultValue ? ` = ${arg.defaultValue}` : '';
			return `${arg.name}: ${arg.type}${typeSuffix}`;
		})
		.join(', ');
}

function unwrapTypeName(payloadType) {
	if (!payloadType) {
		return '';
	}

	return String(payloadType).replaceAll(/[!\[\]\s]/g, '');
}

function getPayloadSdlSnippet({ sourceSdl, subscriptionName, payloadType }) {
	if (!sourceSdl) {
		return '';
	}

	try {
		const ast = parse(sourceSdl);
		const payloadTypeName = unwrapTypeName(payloadType);
		const definitions = [];

		const subscriptionType = ast.definitions.find((definition) => {
			return (
				definition.kind === 'ObjectTypeDefinition' &&
				definition.name?.value === 'Subscription'
			);
		});

		if (subscriptionType?.fields?.length) {
			const selectedField = subscriptionType.fields.find(
				(field) => field.name?.value === subscriptionName
			);

			if (selectedField) {
				definitions.push({
					kind: 'ObjectTypeDefinition',
					name: { kind: 'Name', value: 'Subscription' },
					interfaces: [],
					directives: [],
					fields: [selectedField],
				});
			}
		}

		const payloadDefinition = ast.definitions.find((definition) => {
			return definition?.name?.value === payloadTypeName;
		});

		if (payloadDefinition) {
			definitions.push(payloadDefinition);
		}

		const jsonScalar = ast.definitions.find((definition) => {
			return (
				definition.kind === 'ScalarTypeDefinition' &&
				definition.name?.value === 'JSON'
			);
		});

		if (jsonScalar) {
			definitions.push(jsonScalar);
		}

		if (!definitions.length) {
			return sourceSdl;
		}

		return definitions.map((definition) => print(definition)).join('\n\n');
	} catch (_) {
		return sourceSdl;
	}
}

export default function Subscriptions() {
	const [selectedPayload, setSelectedPayload] = useState(null);
	const { data: sourcesData, loading: sourcesLoading } = useQuery(
		SUBSCRIPTION_SOURCES
	);
	const { data: definitionsData, loading: definitionsLoading } = useQuery(
		SUBSCRIPTION_DEFINITIONS
	);

	const loading = sourcesLoading || definitionsLoading;

	const sources = sourcesData?.subscriptionSources || [];
	const definitions = definitionsData?.subscriptionDefinitions || [];
	const sourceSdlByName = useMemo(() => {
		const map = new Map();
		for (const source of sources) {
			map.set(source.name, source.typeDefs || '');
		}
		return map;
	}, [sources]);

	const filteredDefinitions = useMemo(() => {
		return definitions;
	}, [definitions]);

	const selectedPayloadSdl = useMemo(() => {
		if (!selectedPayload) {
			return '';
		}

		return getPayloadSdlSnippet({
			sourceSdl: sourceSdlByName.get(selectedPayload.sourceName),
			subscriptionName: selectedPayload.name,
			payloadType: selectedPayload.payloadType,
		});
	}, [selectedPayload, sourceSdlByName]);

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!sources.length) {
		return (
			<Info>
				No subscription sources registered yet. Push with POST
				{' '}
				<code>/subscriptions/push</code>
			</Info>
		);
	}

	return (
		<div>
			<Info>
				Subscription catalog from event-stream services. This list is separate
				from federated schema composition.
			</Info>

			<h3 style={{ margin: '8px 0' }}>Sources</h3>
			<table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', padding: '6px 8px' }}>Name</th>
						<th style={{ textAlign: 'left', padding: '6px 8px' }}>Version</th>
						<th style={{ textAlign: 'left', padding: '6px 8px' }}>WS URL</th>
						<th style={{ textAlign: 'left', padding: '6px 8px' }}>Definitions</th>
						<th style={{ textAlign: 'left', padding: '6px 8px' }}>Updated</th>
					</tr>
				</thead>
				<tbody>
					{sources.map((source) => (
						<tr key={source.id}>
							<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
								{source.name}
							</td>
							<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
								{source.version}
							</td>
							<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
								<code>{source.wsUrl || '-'}</code>
							</td>
							<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
								{source.definitionsCount}
							</td>
							<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
								{formatDate(source.updatedTime || source.addedTime)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<h3 style={{ margin: '8px 0' }}>Definitions</h3>
			{filteredDefinitions.length === 0 ? (
				<Info>No subscriptions match current filters.</Info>
			) : (
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={{ textAlign: 'left', padding: '6px 8px' }}>Subscription</th>
							<th style={{ textAlign: 'left', padding: '6px 8px' }}>Arguments</th>
							<th style={{ textAlign: 'left', padding: '6px 8px' }}>Payload</th>
							<th style={{ textAlign: 'left', padding: '6px 8px' }}>Updated</th>
						</tr>
					</thead>
					<tbody>
						{filteredDefinitions.map((row) => (
							<tr key={`${row.id}-${row.sourceName}`}>
								<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
									<code>{row.name}</code>
								</td>
								<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
									<code>{formatArguments(row.arguments)}</code>
								</td>
								<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
									<button
										type="button"
										onClick={() => setSelectedPayload(row)}
										style={{
											padding: 0,
											border: 0,
											background: 'none',
											color: '#1f4ec9',
											cursor: 'pointer',
											fontFamily: 'inherit',
											fontSize: 'inherit',
										}}
									>
										<code>{row.payloadType}</code>
									</button>
								</td>
								<td style={{ borderTop: '1px solid #e5e7eb', padding: '6px 8px' }}>
									{formatDate(row.updatedTime || row.addedTime)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<h3 style={{ margin: '18px 0 8px' }}>Payload SDL</h3>
			{selectedPayloadSdl ? (
				<div>
					<div style={{ marginBottom: 8 }}>
						<strong>{selectedPayload.name}</strong>
						{' → '}
						<code>{selectedPayload.payloadType}</code>
					</div>
					<SourceCodeWithHighlight code={selectedPayloadSdl} />
				</div>
			) : (
				<Info>Click a payload type to preview SDL.</Info>
			)}

		</div>
	);
}
