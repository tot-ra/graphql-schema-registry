import zIndex from '@material-ui/core/styles/zIndex';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Container = styled.div`
	position: fixed;
	top: 0;
	right: 0;
	z-index: ${zIndex.modal};
`;

export const InstanceStats = () => {
	const rootElement = useRef<HTMLElement>(null);

	if (!rootElement.current) {
		rootElement.current = document.createElement('div');
		document.body.appendChild(rootElement.current);
	}

	useEffect(() => () => {
		const el = rootElement.current;
		if (el) {
			document.body.removeChild(el);
		}
	});

	return ReactDOM.createPortal(
		<Container>holi</Container>,
		rootElement.current
	);
};
