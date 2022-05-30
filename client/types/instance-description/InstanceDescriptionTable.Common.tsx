import styled from 'styled-components';
import { colors } from '../../utils';

export const Container = styled.section`
	display: grid;
	grid-auto-columns: auto;
	row-gap: 1rem;
`;

export const InstanceDescriptionTableTitle = styled.h5`
	margin: 0;
	text-transform: uppercase;
	font-weight: normal;
	color: ${colors.black.hex32};
`;
