import { TableCell, TableRow } from '@material-ui/core';
import styled from 'styled-components';
import React from 'react';
import { BaseTable } from './BaseTable';
import { colors } from '../../utils';
import { CommonLink } from '../../components/Link';
import SchemasListing from '../schemas-listing';
import { TypeInstanceOutput } from '../../utils/queries';

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
	<Section>
		<h6>{title}</h6>
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
	</Section>
);
