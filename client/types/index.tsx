import { Route } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import SpinnerCenter from '../components/SpinnerCenter';
import TypesCountingList from './types-counting-list';

import { LIST_TYPES, ListTypesOutput } from '../utils/queries';
import { FlexRow } from '../shared/styled';

const Types = () => {
	const { loading, data, error } = useQuery<ListTypesOutput>(LIST_TYPES);

	if (loading || error) {
		return <SpinnerCenter />;
	}

	const {
		listTypes: { entities, operations },
	} = data;

	return (
		<FlexRow>
			<TypesCountingList entities={entities} operations={operations} />
			<Route
				path="/types/:typeName"
				// component={ServiceDetails}
				exact={false}
			/>
		</FlexRow>
	);
};

export default Types;
