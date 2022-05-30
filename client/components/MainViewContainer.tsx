import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';

const MainViewContainerWrapper = styled.main`
	overflow: auto;
	padding: 2rem;
	display: grid;
	grid-template-rows: auto 1fr;
	row-gap: 2rem;
	background-color: #f5f5f8;
`;

export const MainViewContainer = ({ children }) => {
	const ref = useRef<HTMLElement>(null);

	useLayoutEffect(() => {
		ref.current?.scroll({
			top: 0,
			behavior: 'smooth',
		});
	}, [children]);

	return (
		<MainViewContainerWrapper ref={ref}>
			{children}
		</MainViewContainerWrapper>
	);
};
