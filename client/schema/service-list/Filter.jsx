import React from 'react';

import { FilterInput } from '../styled';
import Tooltip from '@material-ui/core/Tooltip';

const Filter = ({ filterValue, setFilterValue }) => {
	return (
		<Tooltip
			placement="right"
			title="Add ! character in the beginning to exclude text in definitions"
		>
			<FilterInput
				placeholder="Definition or container part.."
				value={filterValue}
				onChange={(e) => setFilterValue(e.target.value)}
			/>
		</Tooltip>
	);
};

export default Filter;
