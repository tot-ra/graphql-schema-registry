import { Collapse, IconButton, TableCell, TableRow } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import styled, { css } from 'styled-components';
import { InstanceStatsTableFieldStats } from './InstanceStatsTable.FieldStats';
import { safeParseInt } from '../../../shared/useCommonParams';

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
	id: number | string;
	name: string;
	label: React.ReactNode;
	executions?: {
		success: number;
		error: number;
		total: number;
	};
	showUsageDetail: boolean;
};

export const InstanceStatsTableRow = ({
	id,
	label,
	executions,
	showUsageDetail,
}: InstanceStatsTableRowProps) => {
	const [isSelected, setSelected] = useState(false);

	const handleOnChange = useCallback(() => {
		setSelected((value) => !value);
	}, []);

	return (
		<>
			<CustomTableRow removeBorderBottom={showUsageDetail}>
				<TableCell component="th" scope="row">
					{label}
				</TableCell>
				<TableCell component="th" scope="row">
					{executions?.total ?? 0}
				</TableCell>
				<TableCell component="th" scope="row">
					{executions?.success ?? 0}
				</TableCell>
				<TableCell component="th" scope="row">
					{executions?.error ?? 0}
				</TableCell>
				{showUsageDetail && (
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
			{showUsageDetail && (
				<TableRow>
					<TableCell
						style={{
							padding: 0,
						}}
						colSpan={5}
					>
						<Collapse in={isSelected} timeout="auto" unmountOnExit>
							<InstanceStatsTableFieldStats
								id={
									typeof id === 'string'
										? safeParseInt(id) ?? 0
										: id
								}
							/>
						</Collapse>
					</TableCell>
				</TableRow>
			)}
		</>
	);
};
