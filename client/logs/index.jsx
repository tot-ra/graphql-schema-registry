// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import React from 'react';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../components/SpinnerCenter';

import { LOGS } from '../utils/queries';
import Info from '../components/Info';

const LOG_NOISE_PATTERNS = [
	/^Validating schema\. Got services schemas from DB transaction\.\.$/i,
	/^Composing graph\. Got services schemas from DB transaction\.\.$/i,
];
const ANSI_COLOR_CODE_REGEX = new RegExp(
	`${String.fromCharCode(27)}\\[[0-9;]*m`,
	'g'
);

function stripAnsi(value) {
	if (typeof value !== 'string') {
		return '';
	}

	return value.replaceAll(ANSI_COLOR_CODE_REGEX, '');
}

function normalizeMessage(message) {
	if (typeof message === 'string') {
		return stripAnsi(message);
	}

	if (Array.isArray(message)) {
		return message
			.map((entry) => {
				if (!entry || typeof entry !== 'object') {
					return '';
				}

				const code = entry.extensions?.code
					? ` (${entry.extensions.code})`
					: '';
				return `${stripAnsi(entry.message || '')}${code}`;
			})
			.filter(Boolean)
			.join('; ');
	}

	if (message && typeof message === 'object') {
		return stripAnsi(JSON.stringify(message));
	}

	return '';
}

function normalizeLevel(level) {
	const cleaned = stripAnsi(level || '').toLowerCase();

	if (cleaned.includes('error')) {
		return 'ERROR';
	}

	if (cleaned.includes('warn')) {
		return 'WARN';
	}

	if (cleaned.includes('debug')) {
		return 'DEBUG';
	}

	return 'INFO';
}

function levelColor(level) {
	switch (level) {
		case 'ERROR':
			return '#b91c1c';
		case 'WARN':
			return '#a16207';
		case 'DEBUG':
			return '#4b5563';
		default:
			return '#0f766e';
	}
}

function formatTimestamp(timestamp) {
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return date.toISOString().slice(0, 23).replace('T', ' ');
}

function shouldHideMessage(message) {
	return LOG_NOISE_PATTERNS.some((pattern) => pattern.test(message));
}

export default function Logs() {
	const { loading, data } = useQuery(LOGS);

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data || !data.logs.length) {
		return <Info>No Logs yet</Info>;
	}

	const rows = data.logs
		.map((row) => ({
			timestamp: formatTimestamp(row.timestamp),
			level: normalizeLevel(row.level),
			message: normalizeMessage(row.message),
		}))
		.filter((row) => row.message && row.timestamp)
		.filter((row) => !shouldHideMessage(row.message))
		.filter(
			(row, index, allRows) =>
				index === 0 ||
				!(
					allRows[index - 1].level === row.level &&
					allRows[index - 1].message === row.message
				)
		);

	if (!rows.length) {
		return <Info>No relevant logs for the selected period</Info>;
	}

	return (
		<div>
			<Info>Recent schema-registry backend logs (UTC, latest first)</Info>

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
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>
							TIMESTAMP (UTC)
						</th>
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>LEVEL</th>
						<th style={{ textAlign: 'left', padding: '6px 10px' }}>MESSAGE</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr key={`${row.timestamp}-${index}`}>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									whiteSpace: 'nowrap',
								}}
							>
								{row.timestamp}
							</td>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									color: levelColor(row.level),
									fontWeight: 600,
									whiteSpace: 'nowrap',
								}}
							>
								{row.level}
							</td>
							<td
								style={{
									borderTop: '1px solid #e5e7eb',
									padding: '6px 10px',
									wordBreak: 'break-word',
								}}
							>
								{row.message}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
