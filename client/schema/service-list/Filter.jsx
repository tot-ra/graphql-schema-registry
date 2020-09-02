import React from 'react';

import { TextField, Tooltip } from '@material-ui/core';

const Filter = ({ filterValue, setFilterValue }) => {
	return (
		<Tooltip
			placement="right"
			title="Add ! character in the beginning to exclude text in definitions"
		>
			<TextField
				value={filterValue}
				onChange={(e) => setFilterValue(e.target.value)}
				variant="outlined"
				label="Search.."
			/>
		</Tooltip>
	);
};

export default Filter;
