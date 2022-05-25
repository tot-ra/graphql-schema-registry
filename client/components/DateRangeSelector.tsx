import React, { useRef, useState, useEffect } from 'react';
import sub from 'date-fns/sub';
import {
	createStyles,
	makeStyles,
	Theme,
	withStyles,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { colors } from '../utils';
import CustomDateRangeSelectorDialog from './CustomDateRangeSelectorDialog';
import zIndex from '@material-ui/core/styles/zIndex';

const parseRangeFromDuration = (duration: Duration) => {
	const now = new Date();
	return {
		from: sub(now, duration),
		to: now,
	};
};

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			margin: theme.spacing(2),
		},
		button: {
			backgroundColor: colors.green.dark,
			'&:hover': {
				backgroundColor: colors.green.ligth,
			},
		},
	})
);

const GreenRadio = withStyles({
	root: {
		'&$checked': {
			color: colors.green.hex,
		},
	},
	checked: {},
})(Radio) as typeof Radio;

interface Range {
	from: Date;
	to: Date;
}

export interface DateRangeSelectorProps {
	range?: Range;
	onRangeChange?: (range: Range) => void;
}

export const getDefaultRange = () => parseRangeFromDuration({ hours: 1 });

const DateRangeSelector = ({
	range,
	onRangeChange = () => null,
}: DateRangeSelectorProps) => {
	const effectiveRange = range ?? getDefaultRange();
	const classes = useStyles();
	const [open, setOpen] = useState(false);
	const [openCustomDialog, setOpenCustomDialog] = useState(false);
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState('hour');

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleClose = (event: React.MouseEvent<EventTarget>) => {
		if (anchorRef.current?.contains(event.target as HTMLElement)) {
			return;
		}

		setOpen(false);
	};

	const prevOpen = useRef(open);

	useEffect(() => {
		if (prevOpen.current && !open) {
			anchorRef.current?.focus();
		}

		prevOpen.current = open;
	}, [open]);

	const handleCloseCustomDialog = (range: Range) => {
		if (range) {
			onRangeChange(range);
		}
		setOpenCustomDialog(false);
	};

	const setRangeFromDuration = (duration: Duration) => {
		onRangeChange(parseRangeFromDuration(duration));
	};

	const rangeOptions = {
		hour: {
			label: 'Last hour',
			fn: () => setRangeFromDuration({ hours: 1 }),
		},
		day: {
			label: 'Last day',
			fn: () => setRangeFromDuration({ days: 1 }),
		},
		'3days': {
			label: 'Last three days',
			fn: () => setRangeFromDuration({ days: 3 }),
		},
		week: {
			label: 'Last week',
			fn: () => setRangeFromDuration({ weeks: 1 }),
		},
		month: {
			label: 'Last month',
			fn: () => setRangeFromDuration({ months: 1 }),
		},
		custom: {
			label: 'Custom...',
			fn: () => {
				setOpenCustomDialog(true);
			},
		},
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue((event.target as HTMLInputElement).value);
		rangeOptions[(event.target as HTMLInputElement).value].fn();
		setOpen(false);
	};

	return (
		<div>
			<Button
				ref={anchorRef}
				aria-controls={open ? 'menu-list-grow' : undefined}
				aria-haspopup="true"
				onClick={handleToggle}
				variant="contained"
				color="primary"
				className={classes.button}
				startIcon={<AccessTimeIcon />}
			>
				{rangeOptions[value].label}
			</Button>
			<Popper
				open={open}
				anchorEl={anchorRef.current}
				role={undefined}
				transition
				disablePortal
			>
				{({ TransitionProps, placement }) => (
					<Grow
						{...TransitionProps}
						style={{
							transformOrigin:
								placement === 'bottom'
									? 'center top'
									: 'center bottom',
						}}
					>
						<Paper style={{ zIndex: zIndex.tooltip }}>
							<ClickAwayListener onClickAway={handleClose}>
								<div className={classes.paper}>
									<FormLabel component="legend">
										TIME RANGE
									</FormLabel>
									<RadioGroup
										aria-label="time-range"
										name="time-range"
										value={value}
										onChange={handleChange}
									>
										{Object.entries(rangeOptions).map(
											([key, { label }]) => {
												return (
													<FormControlLabel
														key={key}
														value={key}
														control={<GreenRadio />}
														label={label}
													/>
												);
											}
										)}
									</RadioGroup>
								</div>
							</ClickAwayListener>
						</Paper>
					</Grow>
				)}
			</Popper>
			<CustomDateRangeSelectorDialog
				range={effectiveRange}
				isOpen={openCustomDialog}
				onClose={handleCloseCustomDialog}
			/>
		</div>
	);
};

export default DateRangeSelector;
