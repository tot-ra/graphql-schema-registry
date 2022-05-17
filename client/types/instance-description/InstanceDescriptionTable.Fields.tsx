import { TableCell, TableRow } from '@material-ui/core';
import styled from 'styled-components';
import React from 'react';
import { BaseTable } from './BaseTable';
import { colors } from '../../utils';
import { Argument } from './Argument';
import { InstanceDescriptionTableFieldsArguments } from './InstanceDescriptionTable.Fields.Arguments';

const Section = styled.section`
	display: grid;
	grid-auto-columns: auto;
	row-gap: 1rem;

	h6 {
		margin: 0;
		text-transform: uppercase;
		font-weight: normal;
		color: ${colors.black.hex32};
	}
`;

const ContainerTableCell = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	row-gap: 1rem;
`;

export type InstanceDescriptionTableFieldsProps = {
	fields: {
		name?: string;
		description?: string;
		isArray: boolean;
		isArrayNullable: boolean;
		isNullable: boolean;
		type: {
			id: number;
			kind: string;
			name: string;
		};
		arguments?: {
			name: string;
			description?: string;
			isArray: boolean;
			isArrayNullable: boolean;
			isNullable: boolean;
			type: {
				id: number;
				kind: string;
				name: string;
			};
		}[];
	}[];
	title: string;
	label: string;
};

export const InstanceDescriptionTableFields = ({
	fields,
	title,
	label,
}: InstanceDescriptionTableFieldsProps) => (
	<Section>
		<h6>{title}</h6>
		<BaseTable label={label}>
			{React.Children.toArray(
				fields.map((field) => (
					// eslint-disable-next-line react/jsx-key
					<TableRow>
						<TableCell component="th" scope="row">
							<Argument
								isArray={field.isArray}
								isArrayNullable={field.isArrayNullable}
								isNullable={field.isNullable}
								name={field.name}
								type={field.type}
							/>
						</TableCell>
						<TableCell>
							<ContainerTableCell>
								{field.description ?? <i>No description</i>}
								{field.arguments?.length > 0 && (
									<InstanceDescriptionTableFieldsArguments
										args={field.arguments}
									/>
								)}
							</ContainerTableCell>
						</TableCell>
					</TableRow>
				))
			)}
		</BaseTable>
	</Section>
);
