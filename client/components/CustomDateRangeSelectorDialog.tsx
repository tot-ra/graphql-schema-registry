import React, { useState } from 'react';
import format from 'date-fns/fp/format';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

const formatDateTimeInput = format('yyyy-MM-dd');

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		container: {
			display: 'flex',
			flexWrap: 'wrap',
		},
		formControl: {
			margin: theme.spacing(2),
			minWidth: 120,
		},
	})
);

interface Range {
	from: Date;
	to: Date;
}

interface InputRange {
	from: string;
	to: string;
}

interface CustomDateRangeSelectorDialogProps {
	range: Range;
	isOpen: boolean;
	onClose: (range?: Range) => void;
}

const CustomDateRangeSelectorDialog = ({
	range,
	isOpen,
	onClose,
}: CustomDateRangeSelectorDialogProps) => {
	const classes = useStyles();
	const [customRange, setCustomRange] = useState<InputRange>({
		from: formatDateTimeInput(range.from),
		to: formatDateTimeInput(range.to),
	});

	const handleChangeFrom = (event: React.ChangeEvent<HTMLInputElement>) => {
		const from = (event.target as HTMLInputElement).value;
		setCustomRange((prevCustomRange) => ({ ...prevCustomRange, from }));
	};

	const handleChangeTo = (event: React.ChangeEvent<HTMLInputElement>) => {
		const to = (event.target as HTMLInputElement).value;
		setCustomRange((prevCustomRange) => ({ ...prevCustomRange, to }));
	};

	return (
		<Dialog open={isOpen} onClose={() => onClose()}>
			<DialogTitle>Custom Time Range</DialogTitle>
			<DialogContent>
				<form className={classes.container}>
					<FormControl className={classes.formControl}>
						<TextField
							id="date-from"
							label="From"
							type="date"
							defaultValue={formatDateTimeInput(range.from)}
							value={customRange.from}
							onChange={handleChangeFrom}
							InputLabelProps={{
								shrink: true,
							}}
						/>
					</FormControl>
					<FormControl className={classes.formControl}>
						<TextField
							id="date-to"
							label="To"
							type="date"
							defaultValue={formatDateTimeInput(range.to)}
							value={customRange.to}
							onChange={handleChangeTo}
							InputLabelProps={{
								shrink: true,
							}}
						/>
					</FormControl>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => onClose()} color="primary">
					Cancel
				</Button>
				<Button
					onClick={() => {
						onClose({
							from: new Date(customRange.from),
							to: new Date(customRange.to),
						});
					}}
					color="primary"
				>
					Ok
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CustomDateRangeSelectorDialog;
