import React from 'react';

import usePrism from '../utils/usePrism';
import { OverflowScroll } from './styled';

const TypeDefs = ({ code }) => {
	const Highlighed = usePrism(code);

	return <OverflowScroll>{Highlighed}</OverflowScroll>;
};

export default TypeDefs;
