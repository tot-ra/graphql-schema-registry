import { TextField, makeStyles } from '@material-ui/core';
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useQuery } from '@apollo/client';
import { SEARCH } from '../utils/queries';

const focusedColor = '#f2e648';
const useStyles = makeStyles(() => ({
	input: {
		color: '#FFFFFF',
	},
	label: {
		color: 'rgba(255, 255, 255, 0.85)',
	},
	root: {
		'& .MuiFilledInput-root': {
			backgroundColor: 'rgba(255, 255, 255, 0.18)',
		},
		'& .MuiFilledInput-root:hover': {
			backgroundColor: 'rgba(255, 255, 255, 0.24)',
		},
		'& .MuiFilledInput-root.Mui-focused': {
			backgroundColor: 'rgba(255, 255, 255, 0.3)',
		},
		'& .MuiFilledInput-root:before': {
			borderBottomColor: 'rgba(255, 255, 255, 0.55)',
		},
		'& .MuiFilledInput-root:hover:not(.Mui-disabled):before': {
			borderBottomColor: 'rgba(255, 255, 255, 0.8)',
		},
		'& label.Mui-focused': {
			color: focusedColor,
		},
		// focused color for input with variant='standard'
		'& .MuiInput-underline:after': {
			borderBottomColor: focusedColor,
		},
		// focused color for input with variant='filled'
		'& .MuiFilledInput-underline:after': {
			borderBottomColor: focusedColor,
		},
		// focused color for input with variant='outlined'
		'& .MuiOutlinedInput-root': {
			'&.Mui-focused fieldset': {
				borderColor: focusedColor,
			},
		},
	},
}));

const GlobalSearch = () => {
	let [selectedResult, selectResult] = useState(0);
	let [filterValue, setFilterValue] = useState('');
	let history = useHistory();
	const inputRef = React.useRef();

	const { data } = useQuery(SEARCH, {
		variables: {
			query: filterValue,
		},
		fetchPolicy: 'no-cache',
	});

	let searchResults =
		data && data.search
			? data.search.map((row) => {
					const resultRow = { ...row };

					if (row.__typename === 'Service') {
						resultRow.href = `/services/${row.name}`;
						resultRow.preview = row.name;
						resultRow.location = 'service : ';
					}

					if (row.__typename === 'SchemaDefinition') {
						resultRow.href = `/services/${row.service.name}/${row.id}/sdl`;
						resultRow.location = `schema : ${row.service.name} > #${row.id}`;

						const strMin = Math.max(row.typeDefs.indexOf(filterValue) - 30, 0);
						const strMax = Math.min(
							strMin + filterValue.length + 60,
							row.typeDefs.length
						);
						resultRow.preview =
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
					return resultRow;
				})
			: [];

	const handleKeyPress = //useCallback(
		(event) => {
			if (event.key === 'Enter' && searchResults[selectedResult]) {
				history.push(searchResults[selectedResult].href);
			}

			if (searchResults.length > 0) {
				if (event.key === 'ArrowUp' && selectedResult > 0) {
					selectResult(selectedResult - 1);
				}
				if (
					event.key === 'ArrowDown' &&
					selectedResult < searchResults.length - 1
				) {
					selectResult(selectedResult + 1);
				}
			}

			if (event.key === 'Escape') {
				setFilterValue('');
				event.target.blur();
			}
		};

	useEffect(() => {
		inputRef.current?.focus();
	}, [inputRef.current]);

	const setTextInputRef = (element) => {
		inputRef.current = element;
		inputRef.current?.focus();
	};

	const classes = useStyles();

	return (
		<div style={{ position: 'relative', width: '100%' }}>
			<TextField
				className={classes.root}
				inputProps={{ className: classes.input }}
				InputLabelProps={{ className: classes.label }}
				size={'small'}
				inputRef={setTextInputRef}
				// inputRef={(input) => input?.focus()}
				value={filterValue}
				onChange={(e) => setFilterValue(e.target.value)}
				onKeyDown={handleKeyPress}
				variant="filled"
				style={{ color: 'white', width: '100%' }}
				label="Search.."
			/>

			{data && data.search && data.search.length && (
				<div
					style={{
						position: 'absolute',
						background: 'white',
						width: '100%',
						left: 0,
						top: '100%',
						marginTop: 4,
						border: '1px solid #999',
						borderRadius: '0 0 5px 5px',
						color: 'black',
						zIndex: '2',
						maxHeight: 340,
						overflowY: 'auto',
						boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
					}}
				>
					{searchResults.map((row, i) => {
						return (
							<div
								key={i}
								style={{
									padding: '10px',
									backgroundColor: selectedResult === i ? '#ffe9d9' : 'white',
								}}
							>
								<Link to={row.href}>
									<span
										style={{
											color: 'gray',
											fontSize: '10px',
										}}
									>
										{row.location}
									</span>{' '}
									<code
										dangerouslySetInnerHTML={{
											__html: row.preview,
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
