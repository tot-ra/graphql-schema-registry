import React from 'react';

import usePrism from '../utils/usePrism';
import { OverflowScroll } from './styled';

const SourceCodeWithHighlight = ({ code }) => {
	const Highlighed = usePrism(code);

	return <OverflowScroll>{Highlighed}</OverflowScroll>;
};

export default SourceCodeWithHighlight;
