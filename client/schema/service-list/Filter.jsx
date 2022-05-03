import { TextField, Tooltip } from '@material-ui/core';

const Filter = ({ filterValue, setFilterValue }) => {
	return (
		<Tooltip
			placement="right"
			title="Add ! character in the beginning to exclude text in definitions"
		>
			<TextField
				size={'small'}
				fullWidth={true}
				value={filterValue}
				onChange={(e) => setFilterValue(e.target.value)}
				variant="outlined"
				style={{ marginTop: '5px' }}
				label="Search.."
			/>
		</Tooltip>
	);
};

export default Filter;
