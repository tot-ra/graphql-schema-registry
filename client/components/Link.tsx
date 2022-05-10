import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors } from '../utils';

export const CommonLink = styled(Link)`
	color: ${colors.green.hex};
	font-size: inherit;

	&:hover {
		text-decoration: underline;
	}
`;
