import { Chart, LineSeries } from 'lightweight-charts-react-components';
import { useQuery } from '@apollo/client';
import { useState } from 'react';

import { SCHEMA_USAGE_SDL } from '../../../utils/queries';
import SpinnerCenter from '../../../components/SpinnerCenter';

function bucketToTimestamp(bucket) {
	const parsedMs = bucket.includes('T')
		? Date.parse(bucket)
		: Date.parse(`${bucket}T00:00:00Z`);

	if (Number.isNaN(parsedMs)) {
		return null;
	}

	return Math.floor(parsedMs / 1000);
}

export default function UsageTabGraph({ entity, property }) {
	const [granularity, setGranularity] = useState('HOUR');
	const { data, loading } = useQuery(SCHEMA_USAGE_SDL, {
		variables: { entity, property, granularity },
	});

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data.schemaPropertyHitsByClient.length) {
		return (
			<div
				style={{
					padding: '40px',
					margin: '0 auto',
					textAlign: 'center',
				}}
			>
				No usages logged
			</div>
		);
	}

	if (data.schemaPropertyHitsByClient.length === 1) {
		const hit = data.schemaPropertyHitsByClient[0];

		return (
			<div
				style={{
					padding: '40px',
					margin: '0 auto',
					textAlign: 'center',
				}}
			>
				{hit.hits} hits by{' '}
				{hit.clientName ? `${hit.clientName}` : 'unknown client'} on {hit.day}
			</div>
		);
	}

	const clientHits = {};

	const nowSec = Math.floor(Date.now() / 1000);
	const last24HoursCutoffSec = nowSec - 24 * 60 * 60;

	for (const hit of data.schemaPropertyHitsByClient) {
		const key = hit?.clientName || 'unknown';

		if (!clientHits[key]) {
			clientHits[key] = {
				name: hit.clientName ? `${hit.clientName}` : 'unknown',
				data: [],
			};
		}

		const time = bucketToTimestamp(hit.bucket);

		if (time === null) {
			continue;
		}

		if (granularity === 'HOUR' && time < last24HoursCutoffSec) {
			continue;
		}

		clientHits[key].data.push({
			time,
			value: Number(hit.hits),
		});
	}

	const series = [];
	const colors = [
		'#1E88E5',
		'#D81B60',
		'#43A047',
		'#FB8C00',
		'#8E24AA',
		'#00ACC1',
	];

	for (const [, clientHitsData] of Object.entries(clientHits)) {
		clientHitsData.data.sort((hitA, hitB) => hitA.time - hitB.time);
		clientHitsData.color = colors[series.length % colors.length];
		series.push(clientHitsData);
	}

	return (
		<div>
			<div style={{ margin: '8px 0' }}>
				<label>
					Granularity
					<select
						value={granularity}
						onChange={(event) => setGranularity(event.target.value)}
						style={{ marginLeft: '8px' }}
					>
						<option value="HOUR">Hourly (24h window)</option>
						<option value="DAY">Daily</option>
					</select>
				</label>
			</div>

			<Chart
				options={{
					layout: {
						attributionLogo: false,
					},
					height: 240,
					timeScale: {
						timeVisible: granularity === 'HOUR',
						secondsVisible: false,
					},
					rightPriceScale: {
						autoScale: true,
					},
				}}
				containerProps={{
					style: {
						width: '100%',
						minWidth: '420px',
						height: '240px',
					},
				}}
			>
				{series.map((seriesRow) => (
					<LineSeries
						key={seriesRow.name}
						data={seriesRow.data}
						options={{
							color: seriesRow.color,
							lineWidth: 2,
							title: seriesRow.name,
						}}
					/>
				))}
			</Chart>

			<table style={{ margin: '0 auto' }}>
				<thead>
					<tr>
						<th>Client</th>
						<th>Hits</th>
						<th>Day</th>
					</tr>
				</thead>
				<tbody>
					{data.schemaPropertyHitsByClient.map((hit) => {
						return (
							<tr
								key={`${hit.clientName || 'unknown'}-${hit.bucket}-${hit.hits}`}
							>
								<td>{hit.clientName}</td>
								<td>{hit.hits}</td>
								<td>{hit.bucket}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
