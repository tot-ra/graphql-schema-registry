import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import { FlexCenter } from './styled';

const SpinnerCenter = () => {
	return (
		<FlexCenter>
			<CircularProgress />
		</FlexCenter>
	);
};

export default SpinnerCenter;
