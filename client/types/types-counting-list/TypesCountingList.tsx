import { ListTypesOutput, LIST_TYPES } from '../../utils/queries';
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

export const TypesCountingList = () => {
	const { loading, data, error } = useQuery<ListTypesOutput>(LIST_TYPES);

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return <TypesCountingListSkeleton />;
	}

	if (error) {
		return <ListContainer>Something wrong happened :(</ListContainer>;
	}

	const {
		listTypes: { entities, operations },
	} = data;

	return (
		<ListContainer as="aside">
			{!operations.length && !entities.length && (
				<EmptyList>No types found!</EmptyList>
			)}
			{operations.length > 0 && (
				<NavigationList>
					{operations.map((operation) => (
						<NavigationListItem
							key={operation.type}
							href={`/types/${operation.type}`}
							value={
								<CountLabel
									text={operation.type}
									count={operation.count}
								/>
							}
							showNavigationChevron={false}
						/>
					))}
				</NavigationList>
			)}
			{entities.length > 0 && (
				<NavigationList>
					{entities.map((entity) => (
						<NavigationListItem
							key={entity.type}
							href={`/types/${entity.type}`}
							value={
								<CountLabel
									text={entity.type}
									count={entity.count}
								/>
							}
							showNavigationChevron={false}
						/>
					))}
				</NavigationList>
			)}
		</ListContainer>
	);
};
