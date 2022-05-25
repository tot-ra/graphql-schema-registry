import { ListCount, ListTypesOutput, LIST_TYPES } from '../../utils/queries';
import {
	EmptyList,
	ListContainer,
	NavigationList,
	NavigationListItem,
} from '../../components/List';
import CountLabel from './CountLabel';
import { useQuery } from '@apollo/client';
import { TypesCountingListSkeleton } from './TypesCountingList.Skeleton';
import useMinimumTime from '../../shared/useMinimumTime';
import { ErrorRetry } from '../../components/ErrorRetry';

const renderList = (values: ListCount[]) => (
	<NavigationList>
		{values.map((value) => (
			<NavigationListItem
				key={value.type}
				href={`/types/${value.type.toLowerCase()}`}
				value={<CountLabel text={value.type} count={value.count} />}
				showNavigationChevron={false}
			/>
		))}
	</NavigationList>
);

export const TypesCountingList = () => {
	const { loading, data, error, refetch } =
		useQuery<ListTypesOutput>(LIST_TYPES);

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return <TypesCountingListSkeleton />;
	}

	if (error) {
		return <ErrorRetry onRetry={refetch} />;
	}

	const {
		listTypes: { entities, operations },
	} = data;

	return (
		<ListContainer as="aside">
			{!operations.length && !entities.length && (
				<EmptyList>No types found!</EmptyList>
			)}
			{operations.length > 0 && renderList(operations)}
			{entities.length > 0 && renderList(entities)}
		</ListContainer>
	);
};
