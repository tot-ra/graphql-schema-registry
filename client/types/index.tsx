import { Route } from 'react-router-dom';

import TypesCountingList from './types-counting-list';
import TypeListingInstances from './type-listing-instances';
import MainSectionContainer from '../components/MainSectionContainer';

const Types = () => (
	<MainSectionContainer gridColumns="0.2fr 0.8fr">
		<Route path="/types" exact>
			<TypesCountingList />
		</Route>
		<Route path="/types/:typeName" exact>
			<TypesCountingList />
			<TypeListingInstances />
		</Route>
		<Route path="/types/:typeName/:instanceId">Hola</Route>
	</MainSectionContainer>
);

export default Types;
