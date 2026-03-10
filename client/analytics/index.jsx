import {
	HashRouter as Router,
	Route,
	useHistory,
	useRouteMatch,
} from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Chart, LineSeries } from 'lightweight-charts-react-components';

import SpinnerCenter from '../components/SpinnerCenter';
import Info from '../components/Info';
import {
	SCHEMA_ENTITY_HITS,
	SCHEMA_FIELDS_USAGE,
	SCHEMA_OPERATION_HITS,
} from '../utils/queries';

const numberFormatter = new Intl.NumberFormat('en-US');
const lineColors = [
	'#1E88E5',
	'#D81B60',
	'#43A047',
	'#FB8C00',
	'#8E24AA',
	'#00ACC1',
	'#5E35B1',
	'#F4511E',
	'#3949AB',
	'#6D4C41',
];

function bucketToTimestamp(bucket) {
	const parsedMs = Date.parse(bucket.includes('T') ? bucket : `${bucket}T00:00:00Z`);

	if (Number.isNaN(parsedMs)) {
		return null;
	}

	return Math.floor(parsedMs / 1000);
}

function hitsByKey(row, key) {
	if (key === 'hits1h') {
		return Number(row.hits1h) || 0;
	}

	if (key === 'hits24h') {
		return Number(row.hits24h) || 0;
	}

	return Number(row.hitsSum) || 0;
}

function sortRows(rows, sortBy, sortDirection) {
	const sortedRows = [...rows];

	sortedRows.sort((rowA, rowB) => {
		if (sortBy === 'entity') {
			const keyA = rowA.property ? `${rowA.entity}.${rowA.property}` : rowA.entity;
			const keyB = rowB.property ? `${rowB.entity}.${rowB.property}` : rowB.entity;

			return sortDirection === 'asc'
				? keyA.localeCompare(keyB)
				: keyB.localeCompare(keyA);
		}

		const hitsA = hitsByKey(rowA, sortBy);
		const hitsB = hitsByKey(rowB, sortBy);

		if (hitsA === hitsB) {
			const keyA = rowA.property ? `${rowA.entity}.${rowA.property}` : rowA.entity;
			const keyB = rowB.property ? `${rowB.entity}.${rowB.property}` : rowB.entity;
			return keyA.localeCompare(keyB);
		}

		return sortDirection === 'asc' ? hitsA - hitsB : hitsB - hitsA;
	});

	return sortedRows;
}

function AnalyticsContent() {
	const history = useHistory();
	const match = useRouteMatch('/:selectedEntity?/:selectedProperty?');
	const selectedEntity = match?.params?.selectedEntity;
	const selectedProperty = match?.params?.selectedProperty;
	const [activeTab, setActiveTab] = useState('entity');
	const [searchTerm, setSearchTerm] = useState('');
	const [topLimit, setTopLimit] = useState('50');
	const [sortBy, setSortBy] = useState('hits24h');
	const [sortDirection, setSortDirection] = useState('desc');
	const [operationSortBy, setOperationSortBy] = useState('hits24h');
	const [operationSortDirection, setOperationSortDirection] = useState('desc');

	const { data: fieldsData, loading: fieldsLoading } = useQuery(SCHEMA_FIELDS_USAGE);
	const { data: entityHitsData, loading: entityHitsLoading } = useQuery(
		SCHEMA_ENTITY_HITS,
		{
			variables: {
				granularity: 'HOUR',
				hours: 24,
			},
		}
	);
	const { data: operationHitsData, loading: operationHitsLoading } = useQuery(
		SCHEMA_OPERATION_HITS,
		{
			variables: {
				granularity: 'HOUR',
				hours: 24,
			},
		}
	);
	const allPropertyRows = fieldsData?.schemaFieldsUsage || [];
	const allEntityRows = useMemo(() => {
		const entityMap = new Map();

		for (const row of allPropertyRows) {
			if (!entityMap.has(row.entity)) {
				entityMap.set(row.entity, {
					entity: row.entity,
					hits1h: 0,
					hits24h: 0,
					hitsSum: 0,
				});
			}

			const current = entityMap.get(row.entity);
			current.hits1h += Number(row.hits1h) || 0;
			current.hits24h += Number(row.hits24h) || 0;
			current.hitsSum += Number(row.hitsSum) || 0;
		}

		return Array.from(entityMap.values());
	}, [allPropertyRows]);
	const isEntityTab = activeTab === 'entity';
	const isPropertyTab = activeTab === 'property';
	const isOperationTab = activeTab === 'operation';
	const baseRows = isEntityTab ? allEntityRows : allPropertyRows;
	const filteredRows = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();

		if (!normalizedTerm) {
			return baseRows;
		}

		return baseRows.filter((row) => {
			const key = row.property
				? `${row.entity}.${row.property}`.toLowerCase()
				: row.entity.toLowerCase();
			return key.includes(normalizedTerm);
		});
	}, [baseRows, searchTerm]);

	const sortedRows = useMemo(
		() => sortRows(filteredRows, sortBy, sortDirection),
		[filteredRows, sortBy, sortDirection]
	);

	const visibleRows = useMemo(() => {
		if (topLimit === 'all') {
			return sortedRows;
		}

		const parsedTopLimit = Number(topLimit);
		if (!parsedTopLimit || parsedTopLimit <= 0) {
			return sortedRows;
		}

		return sortedRows.slice(0, parsedTopLimit);
	}, [sortedRows, topLimit]);

	const entityChartSeries = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();
		const hitsRows = entityHitsData?.schemaEntityHits || [];
		const byEntity = new Map();

		for (const row of hitsRows) {
			if (
				normalizedTerm &&
				!String(row.entity || '')
					.toLowerCase()
					.includes(normalizedTerm)
			) {
				continue;
			}

			const time = bucketToTimestamp(row.bucket);
			if (time === null) {
				continue;
			}

			if (!byEntity.has(row.entity)) {
				byEntity.set(row.entity, []);
			}

			byEntity.get(row.entity).push({
				time,
				value: Number(row.hits) || 0,
			});
		}

		const result = [];
		for (const [entity, dataPoints] of byEntity.entries()) {
			dataPoints.sort((a, b) => a.time - b.time);
			result.push({ key: entity, title: entity, data: dataPoints });
		}

		result.sort((a, b) => a.title.localeCompare(b.title));
		return result;
	}, [entityHitsData, searchTerm]);

	const operationChartSeries = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();
		const hitsRows = operationHitsData?.schemaOperationHits || [];
		const byOperation = new Map();

		for (const row of hitsRows) {
			const key = `${row.operationType}:${row.operationName}`;
			const label = `${row.operationType} ${row.operationName}`;

			if (
				normalizedTerm &&
				!label.toLowerCase().includes(normalizedTerm)
			) {
				continue;
			}

			const time = bucketToTimestamp(row.bucket);
			if (time === null) {
				continue;
			}

			if (!byOperation.has(key)) {
				byOperation.set(key, { title: label, data: [] });
			}

			byOperation.get(key).data.push({
				time,
				value: Number(row.hits) || 0,
			});
		}

		const result = [];
		for (const [key, series] of byOperation.entries()) {
			series.data.sort((a, b) => a.time - b.time);
			result.push({ key, title: series.title, data: series.data });
		}

		result.sort((a, b) => a.title.localeCompare(b.title));
		return result;
	}, [operationHitsData, searchTerm]);

	const chartSeries = isOperationTab ? operationChartSeries : entityChartSeries;

	const operationRows = useMemo(() => {
		const byOperation = new Map();
		const normalizedTerm = searchTerm.trim().toLowerCase();
		const nowSec = Math.floor(Date.now() / 1000);
		const last1hCutoffSec = nowSec - 60 * 60;
		const rows = operationHitsData?.schemaOperationHits || [];

		for (const row of rows) {
			const label = `${row.operationType} ${row.operationName}`;

			if (normalizedTerm && !label.toLowerCase().includes(normalizedTerm)) {
				continue;
			}

			const key = `${row.operationType}:${row.operationName}`;
			const bucketSec = bucketToTimestamp(row.bucket);
			const hits = Number(row.hits) || 0;

			if (!byOperation.has(key)) {
				byOperation.set(key, {
					operationName: row.operationName,
					operationType: row.operationType,
					hits1h: 0,
					hits24h: 0,
				});
			}

			const entry = byOperation.get(key);
			entry.hits24h += hits;

			if (bucketSec !== null && bucketSec >= last1hCutoffSec) {
				entry.hits1h += hits;
			}
		}

		return Array.from(byOperation.values());
	}, [operationHitsData, searchTerm]);

	const sortedOperationRows = useMemo(() => {
		const rows = [...operationRows];

		rows.sort((rowA, rowB) => {
			if (operationSortBy === 'operation') {
				const labelA = `${rowA.operationType} ${rowA.operationName}`;
				const labelB = `${rowB.operationType} ${rowB.operationName}`;

				return operationSortDirection === 'asc'
					? labelA.localeCompare(labelB)
					: labelB.localeCompare(labelA);
			}

			const hitsA = operationSortBy === 'hits1h' ? rowA.hits1h : rowA.hits24h;
			const hitsB = operationSortBy === 'hits1h' ? rowB.hits1h : rowB.hits24h;

			if (hitsA === hitsB) {
				const labelA = `${rowA.operationType} ${rowA.operationName}`;
				const labelB = `${rowB.operationType} ${rowB.operationName}`;
				return labelA.localeCompare(labelB);
			}

			return operationSortDirection === 'asc' ? hitsA - hitsB : hitsB - hitsA;
		});

		return rows;
	}, [operationRows, operationSortBy, operationSortDirection]);

	const visibleOperationRows = useMemo(() => {
		if (topLimit === 'all') {
			return sortedOperationRows;
		}

		const parsedTopLimit = Number(topLimit);
		if (!parsedTopLimit || parsedTopLimit <= 0) {
			return sortedOperationRows;
		}

		return sortedOperationRows.slice(0, parsedTopLimit);
	}, [sortedOperationRows, topLimit]);

	if (
		fieldsLoading ||
		entityHitsLoading ||
		operationHitsLoading
	) {
		return <SpinnerCenter />;
	}

	if (!allPropertyRows.length) {
		return <Info>No usage data logged yet</Info>;
	}

	const onSortChange = (nextSortBy, defaultDirection = 'desc') => {
		if (sortBy === nextSortBy) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
			return;
		}

		setSortBy(nextSortBy);
		setSortDirection(defaultDirection);
	};

	const onOperationSortChange = (nextSortBy, defaultDirection = 'desc') => {
		if (operationSortBy === nextSortBy) {
			setOperationSortDirection(operationSortDirection === 'asc' ? 'desc' : 'asc');
			return;
		}

		setOperationSortBy(nextSortBy);
		setOperationSortDirection(defaultDirection);
	};

	return (
		<div style={{ padding: '16px' }}>
			<div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
				<button
					type="button"
					onClick={() => setActiveTab('entity')}
					style={{
						padding: '8px 12px',
						border: '1px solid #DDDDDD',
						background: activeTab === 'entity' ? '#F0F6FF' : '#FFFFFF',
						cursor: 'pointer',
						fontWeight: activeTab === 'entity' ? 'bold' : 'normal',
					}}
				>
					Entities
				</button>
				<button
					type="button"
					onClick={() => setActiveTab('property')}
					style={{
						padding: '8px 12px',
						border: '1px solid #DDDDDD',
						background: isPropertyTab ? '#F0F6FF' : '#FFFFFF',
						cursor: 'pointer',
						fontWeight: isPropertyTab ? 'bold' : 'normal',
					}}
				>
					Properties
				</button>
				<button
					type="button"
					onClick={() => setActiveTab('operation')}
					style={{
						padding: '8px 12px',
						border: '1px solid #DDDDDD',
						background: activeTab === 'operation' ? '#F0F6FF' : '#FFFFFF',
						cursor: 'pointer',
						fontWeight: activeTab === 'operation' ? 'bold' : 'normal',
					}}
				>
					Operations
				</button>
			</div>

			{!isPropertyTab && (
				<div
					style={{
						border: '1px solid #EEEEEE',
						padding: '12px',
						marginBottom: '16px',
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '8px',
						}}
					>
						<div style={{ fontWeight: 'bold' }}>
							{isOperationTab
								? 'Operation hits (last 24h, 1h buckets)'
								: 'Entity hits (last 24h, 1h buckets)'}
						</div>
					</div>
					{chartSeries.length === 0 ? (
						<Info>No chart data for selected filters</Info>
					) : (
						<Chart
							options={{
								layout: { attributionLogo: false },
								height: 280,
								timeScale: {
									timeVisible: true,
									secondsVisible: false,
								},
								rightPriceScale: {
									autoScale: true,
								},
							}}
							containerProps={{
								style: {
									width: '100%',
									height: '280px',
								},
							}}
						>
							{chartSeries.map((seriesRow, index) => (
								<LineSeries
									key={seriesRow.key}
									data={seriesRow.data}
									options={{
										color: lineColors[index % lineColors.length],
										lineWidth: 2,
										title: seriesRow.title,
									}}
								/>
							))}
						</Chart>
					)}
				</div>
			)}

			{(isEntityTab || isPropertyTab) && (
				<div
					style={{
						display: 'flex',
						gap: '12px',
						marginBottom: '16px',
						flexWrap: 'wrap',
					}}
				>
					<div
						style={{
							border: '1px solid #EEEEEE',
							padding: '12px 16px',
							minWidth: '150px',
						}}
					>
						<div>{isEntityTab ? 'Entities (shown)' : 'Properties (shown)'}</div>
						<strong>{numberFormatter.format(visibleRows.length)}</strong>
					</div>
					<div
						style={{
							border: '1px solid #EEEEEE',
							padding: '12px 16px',
							minWidth: '150px',
						}}
					>
						<div>Hits (1h)</div>
						<strong>
							{numberFormatter.format(
								visibleRows.reduce((sum, row) => sum + (Number(row.hits1h) || 0), 0)
							)}
						</strong>
					</div>
					<div
						style={{
							border: '1px solid #EEEEEE',
							padding: '12px 16px',
							minWidth: '150px',
						}}
					>
						<div>Hits (24h)</div>
						<strong>
							{numberFormatter.format(
								visibleRows.reduce((sum, row) => sum + (Number(row.hits24h) || 0), 0)
							)}
						</strong>
					</div>
					{isPropertyTab && (
						<div
							style={{
								border: '1px solid #EEEEEE',
								padding: '12px 16px',
								minWidth: '150px',
							}}
						>
							<div>Hits (total)</div>
							<strong>
								{numberFormatter.format(
									visibleRows.reduce((sum, row) => sum + (Number(row.hitsSum) || 0), 0)
								)}
							</strong>
						</div>
					)}
				</div>
			)}

			{activeTab === 'operation' && (
				<div
					style={{
						display: 'flex',
						gap: '12px',
						marginBottom: '16px',
						flexWrap: 'wrap',
					}}
				>
					<div
						style={{
							border: '1px solid #EEEEEE',
							padding: '12px 16px',
							minWidth: '150px',
						}}
					>
						<div>Operations (shown)</div>
						<strong>{numberFormatter.format(visibleOperationRows.length)}</strong>
					</div>
					<div
						style={{
							border: '1px solid #EEEEEE',
							padding: '12px 16px',
							minWidth: '150px',
						}}
					>
						<div>Hits (1h)</div>
						<strong>
							{numberFormatter.format(
								visibleOperationRows.reduce((sum, row) => sum + row.hits1h, 0)
							)}
						</strong>
					</div>
					<div
						style={{
							border: '1px solid #EEEEEE',
							padding: '12px 16px',
							minWidth: '150px',
						}}
					>
						<div>Hits (24h)</div>
						<strong>
							{numberFormatter.format(
								visibleOperationRows.reduce((sum, row) => sum + row.hits24h, 0)
							)}
						</strong>
					</div>
				</div>
			)}

			<div
				style={{
					display: 'flex',
					gap: '12px',
					marginBottom: '12px',
					flexWrap: 'wrap',
					alignItems: 'center',
				}}
			>
				<input
					type="text"
					placeholder={
						isOperationTab
							? 'Search operation'
							: isEntityTab
								? 'Search entity'
								: 'Search entity.field'
					}
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					style={{ padding: '8px', minWidth: '250px' }}
				/>

				<label>
					Top
					<select
						value={topLimit}
						onChange={(event) => setTopLimit(event.target.value)}
						style={{ marginLeft: '8px' }}
					>
						<option value="25">25</option>
						<option value="50">50</option>
						<option value="100">100</option>
						<option value="250">250</option>
						<option value="all">All</option>
					</select>
				</label>
			</div>

			{(isEntityTab || isPropertyTab) && (
				<div style={{ width: '100%' }}>
					<table width="100%">
						<thead>
							<tr>
								<th>
									<button
										type="button"
										onClick={() => onSortChange('entity', 'asc')}
										style={{
											cursor: 'pointer',
											background: 'transparent',
											border: 0,
											padding: 0,
											fontWeight: 'bold',
										}}
									>
										{isEntityTab ? 'Entity' : 'Entity.field'}{' '}
										{sortBy === 'entity' ? `(${sortDirection})` : ''}
									</button>
								</th>
								<th>
									<button
										type="button"
										onClick={() => onSortChange('hits1h')}
										style={{
											cursor: 'pointer',
											background: 'transparent',
											border: 0,
											padding: 0,
											fontWeight: 'bold',
										}}
									>
										Hits (1h) {sortBy === 'hits1h' ? `(${sortDirection})` : ''}
									</button>
								</th>
								<th>
									<button
										type="button"
										onClick={() => onSortChange('hits24h')}
										style={{
											cursor: 'pointer',
											background: 'transparent',
											border: 0,
											padding: 0,
											fontWeight: 'bold',
										}}
									>
										Hits (24h) {sortBy === 'hits24h' ? `(${sortDirection})` : ''}
									</button>
								</th>
								<th>
									<button
										type="button"
										onClick={() => onSortChange('hitsSum')}
										style={{
											cursor: 'pointer',
											background: 'transparent',
											border: 0,
											padding: 0,
											fontWeight: 'bold',
										}}
									>
										Hits (total) {sortBy === 'hitsSum' ? `(${sortDirection})` : ''}
									</button>
								</th>
							</tr>
						</thead>
						<tbody>
							{visibleRows.map((row) => {
								const isSelected = isPropertyTab
									? selectedEntity === row.entity && selectedProperty === row.property
									: selectedEntity === row.entity && !selectedProperty;

								return (
									<tr key={isPropertyTab ? `${row.entity}.${row.property}` : row.entity}>
										<td>
											<button
												type="button"
												onClick={() => {
													history.push(
														isPropertyTab
															? `/${row.entity}/${row.property}`
															: `/${row.entity}`
													);
												}}
												style={{
													textDecoration: 'underline',
													cursor: 'pointer',
													color: isSelected ? '#3179e2' : 'black',
													fontWeight: isSelected ? 'bold' : 'normal',
													background: 'transparent',
													border: 0,
													padding: 0,
													textAlign: 'left',
												}}
											>
												{isPropertyTab ? `${row.entity}.${row.property}` : row.entity}
											</button>
										</td>
										<td align="center">{numberFormatter.format(Number(row.hits1h) || 0)}</td>
										<td align="center">{numberFormatter.format(Number(row.hits24h) || 0)}</td>
										<td align="center">{numberFormatter.format(Number(row.hitsSum) || 0)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					{!visibleRows.length && (
						<Info>
							{isEntityTab
								? 'No entities match current filters'
								: 'No properties match current filters'}
						</Info>
					)}
				</div>
			)}

			{activeTab === 'operation' && (
				<div style={{ width: '100%' }}>
					<table width="100%">
						<thead>
							<tr>
								<th>
									<button
										type="button"
										onClick={() => onOperationSortChange('operation', 'asc')}
										style={{
											cursor: 'pointer',
											background: 'transparent',
											border: 0,
											padding: 0,
											fontWeight: 'bold',
										}}
									>
										Operation{' '}
										{operationSortBy === 'operation'
											? `(${operationSortDirection})`
											: ''}
									</button>
								</th>
								<th>
									<button
										type="button"
										onClick={() => onOperationSortChange('hits1h')}
										style={{
											cursor: 'pointer',
											background: 'transparent',
											border: 0,
											padding: 0,
											fontWeight: 'bold',
										}}
									>
										Hits (1h){' '}
										{operationSortBy === 'hits1h'
											? `(${operationSortDirection})`
											: ''}
									</button>
								</th>
								<th>
									<button
										type="button"
										onClick={() => onOperationSortChange('hits24h')}
										style={{
											cursor: 'pointer',
											background: 'transparent',
											border: 0,
											padding: 0,
											fontWeight: 'bold',
										}}
									>
										Hits (24h){' '}
										{operationSortBy === 'hits24h'
											? `(${operationSortDirection})`
											: ''}
									</button>
								</th>
							</tr>
						</thead>
						<tbody>
							{visibleOperationRows.map((row) => (
								<tr key={`${row.operationType}:${row.operationName}`}>
									<td>{row.operationType} {row.operationName}</td>
									<td align="center">{numberFormatter.format(row.hits1h)}</td>
									<td align="center">{numberFormatter.format(row.hits24h)}</td>
								</tr>
							))}
						</tbody>
					</table>
					{!visibleOperationRows.length && (
						<Info>No operations match current filters</Info>
					)}
				</div>
			)}
		</div>
	);
}

export default function Analytics() {
	return (
		<Router basename="/analytics">
			<Route
				path="/:selectedEntity?/:selectedProperty?"
				component={AnalyticsContent}
			/>
		</Router>
	);
}
