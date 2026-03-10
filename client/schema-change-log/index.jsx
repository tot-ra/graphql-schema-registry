import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import SpinnerCenter from '../components/SpinnerCenter';
import Info from '../components/Info';
import { SCHEMA_CHANGE_LOG } from '../utils/queries';

function formatDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return format(date, 'yyyy-MM-dd');
}

function formatTime(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return format(date, 'HH:mm:ss');
}

function shortHash(hash) {
	if (!hash) {
		return 'n/a';
	}

	return hash.slice(0, 8);
}

export default function SchemaChangeLog() {
	const { loading, data } = useQuery(SCHEMA_CHANGE_LOG, {
		variables: {
			limit: 500,
			offset: 0,
		},
	});

	if (loading) {
		return <SpinnerCenter />;
	}

	const rows = data?.schemaChangeLog || [];

	if (!rows.length) {
		return <Info>No schema changes found.</Info>;
	}

	return (
		<div>
			<Info>
				Chronological schema changes across subgraphs (latest first)
			</Info>
			<table
				style={{
					width: '100%',
					borderCollapse: 'collapse',
					fontFamily:
						'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
					fontSize: 13,
				}}
			>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>DATE</th>
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>TIME</th>
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>SUBGRAPH</th>
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>SCHEMA</th>
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>CHANGE</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={`${row.schemaId}-${row.changeType}-${index}`}
							style={{ verticalAlign: 'top' }}
						>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									whiteSpace: 'nowrap',
								}}
							>
								{formatDate(row.addedTime)}
							</td>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									whiteSpace: 'nowrap',
								}}
							>
								{formatTime(row.addedTime)}
							</td>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									whiteSpace: 'nowrap',
								}}
							>
								{row.serviceName}
							</td>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									whiteSpace: 'nowrap',
								}}
							>
								<Link to={`/services/${row.serviceName}/${row.schemaId}/sdl`}>
									{shortHash(row.schemaUUID)}
								</Link>
							</td>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									wordBreak: 'break-word',
								}}
							>
								{row.change}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
