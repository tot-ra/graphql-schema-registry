import { TableCell, TableRow } from '@material-ui/core';
import React from 'react';
import { BaseTable } from './BaseTable';
import { Argument } from './Argument';
import { InstanceDescriptionTableFieldsArguments } from './InstanceDescriptionTable.Fields.Arguments';
import {
	Container,
	InstanceDescriptionTableTitle,
} from './InstanceDescriptionTable.Common';

export type InstanceDescriptionTableFieldsProps = {
	fields: {
		name?: string;
		description?: string;
		isDeprecated?: boolean;
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
	<Container>
		<InstanceDescriptionTableTitle>{title}</InstanceDescriptionTableTitle>
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
								isDeprecated={field.isDeprecated}
							/>
						</TableCell>
						<TableCell>
							<Container>
								{field.description ?? <i>No description</i>}
								{field.arguments?.length > 0 && (
									<InstanceDescriptionTableFieldsArguments
										args={field.arguments}
									/>
								)}
							</Container>
						</TableCell>
					</TableRow>
				))
			)}
		</BaseTable>
	</Container>
);
