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
import styled from 'styled-components';

type InstanceDescriptionTableFieldsProvidedProps = {
	fields: TypeInstanceOutput['getTypeInstance']['usedBy'];
	title: string;
	label: string;
	hideParentFromLabel?: boolean;
};

const CustomCommonLink = styled(CommonLink)`
	word-spacing: -4px;
`;

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
							<CustomCommonLink
								to={`/types/${field.parent.type.toLowerCase()}/${
									field.parent.id
								}`}
							>
								{!hideParentFromLabel && (
									<>
										<span>{field.parent.name}</span>
										<span> . </span>
									</>
								)}
								<span>{field.key}</span>
							</CustomCommonLink>
						</TableCell>
						<TableCell>
							{field.description ?? <i>No description</i>}
						</TableCell>
						<TableCell>
							<SchemasListing schemas={[field.providedBy]} />
						</TableCell>
					</TableRow>
				))
			)}
		</BaseTable>
	</Container>
);
