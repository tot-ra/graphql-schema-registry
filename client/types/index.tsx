import { Route } from 'react-router-dom';

import TypesCountingList from './types-counting-list';
import TypeListingInstances from './type-listing-instances';
import MainSectionContainer from '../components/MainSectionContainer';
import InstancesSideListing from './instances-side-listing';

const Types = () => (
	<MainSectionContainer gridColumns="0.2fr 0.8fr">
		<Route path="/types" exact>
			<TypesCountingList />
		</Route>
		<Route path="/types/:typeName" exact>
			<TypesCountingList />
			<TypeListingInstances />
		</Route>
		<Route path="/types/:typeName/:instanceId">
			<InstancesSideListing />
		</Route>
	</MainSectionContainer>
);

export default Types;
