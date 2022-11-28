import { Lines, Chart, Dots } from 'rumble-charts';
import { useQuery } from '@apollo/client';

import { SCHEMA_USAGE_SDL } from '../../../utils/queries';
import SpinnerCenter from '../../../components/SpinnerCenter';

export default function UsageTabGraph({ entity, property }) {
	const { data, loading } = useQuery(SCHEMA_USAGE_SDL, {
		variables: { entity, property },
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
				{hit.clientName ? `${hit.clientName}` : 'unknown client'} on{' '}
				{hit.day}
			</div>
		);
	}

	const clientHits = {};

	let max = 0;

	for (const hit of data.schemaPropertyHitsByClient) {
		// key is needed to draw different lines, depending on segmentation
		const key = hit?.clientName;

		if (!clientHits[key]) {
			clientHits[key] = {
				name: hit.clientName ? `${hit.clientName}` : 'unknown',
				data: [],
			};
		}

		const [, month, day] = hit.day.split('-');

		clientHits[key].data.push([
			month * 30 + day, // x on the graph - just convert days of the year into pixels
			hit.hits, // y on the graph
		]);

		if (hit.hits > max) {
			max = hit.hits; // pick max hits for the graph
		}
	}

	const series = [];

	for (const [, clientHitsData] of Object.entries(clientHits)) {
		series.push(clientHitsData);
	}

	return (
		<div>
			<Chart
				width={450}
				height={200}
				series={series}
				minY={0}
				maxY={max * 1.3}
			>
				<Lines />
				<Dots />
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
							<tr key={hit.clientName}>
								<td>{hit.clientName}</td>
								<td>{hit.hits}</td>
								<td>{hit.day}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
