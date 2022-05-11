import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import {
	ListContainer,
	NavigationList,
	NavigationListItem,
} from '../../components/List';
import { TypeSideInstancesOutput } from '../../utils/queries';

const InstanceSideListingBodyContainer = styled(ListContainer)`
	padding-bottom: 2rem;
`;

type InstanceSideListingBodyProps = {
	items: TypeSideInstancesOutput['listTypeInstances']['items'];
	typeName: string;
	instanceId: string;
};

export const InstanceSideListingBody = ({
	items,
	typeName,
	instanceId,
}: InstanceSideListingBodyProps) => {
	const selectedRef = useRef<HTMLAnchorElement>(null);

	useLayoutEffect(() => {
		selectedRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	}, []);

	return (
		<InstanceSideListingBodyContainer>
			<NavigationList>
				{items.map((item) => (
					<NavigationListItem
						key={item.id}
						href={`/types/${typeName}/${item.id}`}
						value={item.name}
						showNavigationChevron={false}
						ref={
							`${item.id}` === instanceId
								? selectedRef
								: undefined
						}
					/>
				))}
			</NavigationList>
		</InstanceSideListingBodyContainer>
	);
};
