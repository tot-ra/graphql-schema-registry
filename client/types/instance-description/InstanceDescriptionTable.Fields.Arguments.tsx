import { List, ListItem } from '@material-ui/core';
import styled from 'styled-components';
import { colors } from '../../utils';
import { Argument } from './Argument';
import { InstanceDescriptionTableFieldsProps } from './InstanceDescriptionTable.Fields';

const Container = styled.section`
	display: grid;
	grid-auto-rows: auto;
	color: ${colors.black.hex24};

	> h5 {
		margin: 0;
	}
`;

type InstanceDescriptionTableFieldsArgumentsProps = {
	args: Required<
		InstanceDescriptionTableFieldsProps['fields'][0]['arguments']
	>;
};

export const InstanceDescriptionTableFieldsArguments = ({
	args,
}: InstanceDescriptionTableFieldsArgumentsProps) => (
	<Container>
		<h5>Arguments</h5>
		<List disablePadding>
			{args.map((argument) => (
				<ListItem key={argument.name} disableGutters>
					<Argument
						name={argument.name}
						type={argument.type}
						isArray={argument.isArray}
						isArrayNullable={argument.isArrayNullable}
						isNullable={argument.isNullable}
					/>
				</ListItem>
			))}
		</List>
	</Container>
);
