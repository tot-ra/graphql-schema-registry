import { Collapse, IconButton, TableCell, TableRow } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';

type CustomTableRowProps = {
	removeBorderBottom: boolean;
};

const CustomTableRow = styled(TableRow)<CustomTableRowProps>`
	${({ removeBorderBottom }) =>
		removeBorderBottom &&
		css`
			th {
				border-bottom: 0;
			}
		`}
`;

export type InstanceStatsTableRowProps = {
	name: string;
	label: React.ReactNode;
	usageStats?: {
		success: number;
		error: number;
	};
	details?: React.ReactNode;
};

export const InstanceStatsTableRow = ({
	details,
	label,
	usageStats,
}: InstanceStatsTableRowProps) => {
	const [isSelected, setSelected] = useState(false);
	const error = usageStats?.error ?? 0;
	const success = usageStats?.success ?? 0;
	const total = error + success;

	const handleOnChange = useCallback(() => {
		setSelected((value) => !value);
	}, []);

	return (
		<>
			<CustomTableRow removeBorderBottom={!!details}>
				<TableCell component="th" scope="row">
					{label}
				</TableCell>
				<TableCell component="th" scope="row">
					{total}
				</TableCell>
				<TableCell component="th" scope="row">
					{success}
				</TableCell>
				<TableCell component="th" scope="row">
					{error}
				</TableCell>
				{!!details && total > 0 && (
					<TableCell component="th" scope="row">
						<IconButton onClick={handleOnChange}>
							{isSelected && (
								<ArrowDropUpIcon titleAccess="Stats" />
							)}
							{!isSelected && (
								<ArrowDropDownIcon titleAccess="Stats" />
							)}
						</IconButton>
					</TableCell>
				)}
			</CustomTableRow>
			{!!details && (
				<TableRow>
					<TableCell style={{ padding: 0 }} colSpan={5}>
						<Collapse in={isSelected} timeout="auto" unmountOnExit>
							{details}
						</Collapse>
					</TableCell>
				</TableRow>
			)}
		</>
	);
};
