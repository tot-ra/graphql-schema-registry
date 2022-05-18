import { Chip } from '@material-ui/core';
import styled from 'styled-components';
import { NormalizedLabel } from '../../shared/styled';
import { colors } from '../../utils';

const CountLabelContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	& > ${NormalizedLabel} {
		color: ${colors.black.hex5};
	}
`;

type CountLabelProps = {
	text: string;
	count: number;
};

const CountLabel = ({ text, count }: CountLabelProps) => (
	<CountLabelContainer>
		<NormalizedLabel>{text}</NormalizedLabel>
		<Chip label={count} size="small" color="default" />
	</CountLabelContainer>
);

export default CountLabel;
