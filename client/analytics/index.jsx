import { HashRouter as Router, Route, useHistory, useRouteMatch } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../components/SpinnerCenter';
import Info from '../components/Info';
import { SCHEMA_FIELDS_USAGE } from '../utils/queries';
import UsageGraph from '../schema/service-details/UsageTab/graph';

function AnalyticsContent() {
	const history = useHistory();
	const match = useRouteMatch('/:selectedEntity?/:selectedProperty?');
	const selectedEntity = match?.params?.selectedEntity;
	const selectedProperty = match?.params?.selectedProperty;
	const entity = selectedEntity;
	const property = selectedProperty;

	const { data, loading } = useQuery(SCHEMA_FIELDS_USAGE);

	if (loading) {
		return <SpinnerCenter />;
	}

	if (!data || !data.schemaFieldsUsage.length) {
		return <Info>No usage data logged yet</Info>;
	}

	return (
		<div style={{ display: 'flex' }}>
			<div style={{ padding: '20px', maxWidth: '500px' }}>
				<table width="100%">
					<thead>
						<tr>
							<th>Entity</th>
							<th>Total hits</th>
						</tr>
					</thead>
					<tbody>
						{data.schemaFieldsUsage.map((row) => {
							const selected =
								entity === row.entity && property === row.property;

							return (
								<tr key={`${row.entity}.${row.property}`}>
									<td
										style={{
											textDecoration: 'underline',
											cursor: 'pointer',
											color: selected ? '#3179e2' : 'black',
											fontWeight: selected ? 'bold' : 'normal',
										}}
										onClick={() => {
											history.push(`/${row.entity}/${row.property}`);
										}}
									>
										{row.entity}.{row.property}
									</td>

									<td align={'center'}>{row.hitsSum}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{entity && property && (
				<div
					style={{
						flexGrow: '1',
						border: '1px',
						borderColor: '#EEEEEE',
						borderStyle: 'solid',
						textAlign: 'center',
					}}
				>
					<UsageGraph entity={entity} property={property} />
				</div>
			)}
		</div>
	);
}

export default function Analytics() {
	return (
		<Router basename="/analytics">
			<Route path="/:selectedEntity?/:selectedProperty?" component={AnalyticsContent} />
		</Router>
	);
}
