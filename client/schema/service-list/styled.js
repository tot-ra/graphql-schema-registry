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

export const ServiceLabel = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 8px;
`;

export const ServiceStatusDot = styled.span`
	width: 8px;
	height: 8px;
	border-radius: 999px;
	flex-shrink: 0;
	background-color: ${({ status }) => (status === 'UP' ? '#2e7d32' : '#9e9e9e')};
`;
