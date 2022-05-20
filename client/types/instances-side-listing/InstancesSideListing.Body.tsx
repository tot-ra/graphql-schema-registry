import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import {
	ListContainer,
	NavigationList,
	NavigationListItem,
} from '../../components/List';
import { TypeSideInstancesOutput } from '../../utils/queries';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const InstanceSideListingBodyContainer = styled(ListContainer)`
	padding-bottom: 2rem;
`;

type InstanceSideListingBodyProps = {
	items: TypeSideInstancesOutput['listTypeInstances']['items'];
	typeName: string;
	instanceId: string;
	buildHref?: (args: {
		typeName: string;
		item: Unpacked<TypeSideInstancesOutput['listTypeInstances']['items']>;
	}) => string;
};

const defaultBuildHref: InstanceSideListingBodyProps['buildHref'] = ({
	typeName,
	item,
}) => `/types/${typeName}/${item.id}`;

export const InstancesSideListingBody = ({
	items,
	typeName,
	instanceId,
	buildHref = defaultBuildHref,
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
						href={buildHref({
							typeName: typeName.toLowerCase(),
							item,
						})}
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
