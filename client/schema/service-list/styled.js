import styled from 'styled-components';
import { colors } from '../../utils';

export const ServiceBlock = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	& > :last-child {
		color: ${({ selected }) => (selected ? 'white' : colors.black.hex32)};
	}
`;
