import { TableCell, TableRow } from '@material-ui/core';
import React from 'react';
import { BaseTable } from './BaseTable';
import { CommonLink } from '../../components/Link';
import SchemasListing from '../schemas-listing';
import { TypeInstanceOutput } from '../../utils/queries';
import {
	Container,
	InstanceDescriptionTableTitle,
} from './InstanceDescriptionTable.Common';

type InstanceDescriptionTableFieldsProvidedProps = {
	fields: TypeInstanceOutput['getTypeInstance']['usedBy'];
	title: string;
	label: string;
	hideParentFromLabel?: boolean;
};

export const InstanceDescriptionTableFieldsProvided = ({
	fields,
	title,
	label,
	hideParentFromLabel = false,
}: InstanceDescriptionTableFieldsProvidedProps) => (
	<Container>
		<InstanceDescriptionTableTitle>{title}</InstanceDescriptionTableTitle>
		<BaseTable label={label} columns="3">
			{React.Children.toArray(
				fields.map((field) => (
					// eslint-disable-next-line react/jsx-key
					<TableRow>
						<TableCell component="th" scope="row">
							<CommonLink
								to={`/types/${field.parent.name}/${field.parent.id}`}
							>
								{[
									!hideParentFromLabel &&
										`${field.parent.name}.`,
									`${field.key}`,
								]
									.filter(Boolean)
									.join('')}
							</CommonLink>
						</TableCell>
						<TableCell>
							{field.description ?? <i>No description</i>}
						</TableCell>
						<TableCell>
							<SchemasListing schemas={field.providedBy} />
						</TableCell>
					</TableRow>
				))
			)}
		</BaseTable>
	</Container>
);
