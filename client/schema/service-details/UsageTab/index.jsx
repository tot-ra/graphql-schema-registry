/* eslint-disable react/jsx-key */
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';

import UsageGraph from './graph';
import { SCHEMA_SDL } from '../../../utils/queries';
import SpinnerCenter from '../../../components/SpinnerCenter';

export default function UsageTab({ schemaId }) {
	const history = useHistory();
	const { serviceName } = useParams();
	const match = useRouteMatch(
		'/:serviceName/:schemaId/:subtab/:selectedEntity?/:selectedProperty?'
	);
	const selectedEntity = match?.params?.selectedEntity;
	const selectedProperty = match?.params?.selectedProperty;

	const { data, loading } = useQuery(SCHEMA_SDL, {
		variables: { schemaId },
	});

	const [entity, setEntity] = useState(selectedEntity);
	const [property, setProperty] = useState(selectedProperty);

	if (loading) {
		return <SpinnerCenter />;
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
						{data.schema.fieldsUsage.map((row) => {
							const selected =
								entity === row.entity &&
								property === row.property;

							return (
								<tr key={`${row.entity}.${row.property}`}>
									<td
										style={{
											textDecoration: 'underline',
											cursor: 'pointer',
											color: selected
												? '#3179e2'
												: 'black',
											fontWeight: selected
												? 'bold'
												: 'normal',
										}}
										onClick={() => {
											history.push(
												`/${serviceName}/${schemaId}/usage/${row.entity}/${row.property}`
											);
											setEntity(row.entity);
											setProperty(row.property);
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
