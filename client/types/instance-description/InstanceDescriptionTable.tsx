import { useMemo } from 'react';
import styled from 'styled-components';
import { TypeInstanceOutput } from '../../utils/queries';
import { InstanceDescriptionTableFields } from './InstanceDescriptionTable.Fields';
import { InstanceDescriptionTableFieldsProvided } from './InstanceDescriptionTable.FieldsProvided';
import { InstanceDescriptionTitle } from './InstanceDescriptionTitle';

export const Container = styled.section`
	display: grid;
	grid-auto-rows: auto;
	row-gap: 2rem;
`;

type InstanceDescriptionTableProps = TypeInstanceOutput['getTypeInstance'];

export const InstanceDescriptionTable = ({
	name,
	description,
	type,
	fields,
	inputParams,
	outputParams,
	usedBy,
	implementations,
}: InstanceDescriptionTableProps) => {
	const fieldsMemo = useMemo(
		() =>
			fields.map((field) => ({
				name: field.key,
				description: field.description,
				isDeprecated: field.isDeprecated,
				isArray: field.isArray,
				isNullable: field.isNullable,
				isArrayNullable: field.isArrayNullable,
				type: {
					id: field.parent.id,
					kind: field.parent.type,
					name: field.parent.name,
				},
				arguments: field.arguments?.map((argument) => ({
					name: argument.name,
					description: argument.description,
					isArray: argument.parent.isArray,
					isArrayNullable: argument.parent.isArrayNullable,
					isNullable: argument.parent.isNullable,
					type: {
						id: argument.parent.id,
						kind: argument.parent.type,
						name: argument.parent.type,
					},
				})),
			})),
		[fields]
	);

	const inputParamsMemo = useMemo(
		() =>
			inputParams.map((inputParam) => ({
				name: inputParam.key,
				description: inputParam.description,
				isArray: inputParam.isArray,
				isNullable: inputParam.isNullable,
				isArrayNullable: inputParam.isArrayNullable,
				type: {
					id: inputParam.parent.id,
					kind: inputParam.parent.type,
					name: inputParam.parent.name,
				},
			})),
		[inputParams]
	);

	const outputParamsMemo = useMemo(
		() =>
			outputParams.map((outputParam) => ({
				description: outputParam.description,
				isArray: outputParam.isArray,
				isNullable: outputParam.isNullable,
				isArrayNullable: outputParam.isArrayNullable,
				type: {
					id: outputParam.parent.id,
					kind: outputParam.parent.type,
					name: outputParam.parent.name,
				},
			})),
		[outputParams]
	);

	return (
		<Container>
			<InstanceDescriptionTitle
				title={name}
				description={description}
				type={type}
			/>
			{fields.length > 0 && (
				<InstanceDescriptionTableFields
					fields={fieldsMemo}
					title="Fields"
					label="Field"
				/>
			)}
			{inputParams.length > 0 && (
				<InstanceDescriptionTableFields
					fields={inputParamsMemo}
					title="Input params"
					label="Param"
				/>
			)}
			{outputParams.length > 0 && (
				<InstanceDescriptionTableFields
					fields={outputParamsMemo}
					title="Output params"
					label="Param"
				/>
			)}
			{usedBy.length > 0 && (
				<InstanceDescriptionTableFieldsProvided
					fields={usedBy}
					title="Used by"
					label="Entity"
				/>
			)}
			{implementations.length > 0 && (
				<InstanceDescriptionTableFieldsProvided
					fields={implementations}
					title="Implemented by"
					label="Entity"
					hideParentFromLabel
				/>
			)}
		</Container>
	);
};
