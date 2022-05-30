import styled from 'styled-components';
import { colors } from '../utils';

type MainSectionContainerProps = {
	gridColumns?: string;
};

const MainSectionContainer = styled.div<MainSectionContainerProps>`
	width: 100%;
	height: 100%;
	overflow: hidden;
	display: grid;
	grid-template-columns: ${({ gridColumns = '1fr' }) => gridColumns};

	& > :not(:nth-child(3)) {
		border-right: 1px solid ${colors.black.hex256};
	}
`;

export default MainSectionContainer;
