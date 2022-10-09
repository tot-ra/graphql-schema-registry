import { TextField, makeStyles } from '@material-ui/core';
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useQuery } from '@apollo/client';
import { SEARCH } from '../utils/queries';

const useStyles = makeStyles(() => ({
	input: {
		color: '#FFFFFF',
	},
}));

const GlobalSearch = () => {
	let [filterValue, setFilterValue] = useState('');
	const { data } = useQuery(SEARCH, {
		variables: {
			query: filterValue,
		},
	});

	const classes = useStyles();

	return (
		<div>
			<TextField
				inputProps={{ className: classes.input }}
				size={'small'}
				// fullWidth={true}
				value={filterValue}
				onChange={(e) => setFilterValue(e.target.value)}
				variant="filled"
				style={{ color: 'white' }}
				label="Search.."
			/>

			{data?.search && data?.search.length && (
				<div
					style={{
						position: 'absolute',
						background: 'white',
						width: '60%',
						right: 0,
						top: 49,
						border: '1px solid #999',
						borderRadius: '0 0 5px 5px',
						padding: '10px',
						color: 'black',
						zIndex: '2',
					}}
				>
					{data.search.map((row, i) => {
						let href, preview, location;

						if (row.__typename === 'Service') {
							href = `/schema/${row.name}`;
							preview = row.name;
							location = 'service : ';
						}
						if (row.__typename === 'SchemaDefinition') {
							href = `/schema/${row.service.name}/${row.id}/sdl`;
							location = `schema : ${row.service.name} > #${row.id}`;

							const strMin = Math.max(
								row.typeDefs.indexOf(filterValue) - 30,
								0
							);
							const strMax = Math.min(
								strMin + filterValue.length + 60,
								row.typeDefs.length
							);
							preview =
								(!strMin ? '' : '..') +
								row.typeDefs
									.substring(strMin, strMax)
									.replace(
										filterValue,
										'<strong style="background-color:yellow;">' +
											filterValue +
											'</strong>'
									);
						}

						return (
							<div key={i}>
								<Link to={href}>
									<span
										style={{
											color: 'gray',
											fontSize: '10px',
										}}
									>
										{location}
									</span>{' '}
									<code
										dangerouslySetInnerHTML={{
											__html: preview,
										}}
									/>
								</Link>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default GlobalSearch;
