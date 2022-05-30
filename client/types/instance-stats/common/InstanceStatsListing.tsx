import React from 'react';
import styled from 'styled-components';
import { TypeInstanceOperationStatsOutput } from '../../../utils/queries';
import { InstanceDescriptionTitle } from '../../instance-description/InstanceDescriptionTitle';

export const Container = styled.section`
	row-gap: 2rem;
	display: flex;
	flex-direction: column;
`;

type InstanceStatsListingProps = Omit<
	TypeInstanceOperationStatsOutput['getTypeInstance'],
	'id'
> & {
	children: React.ReactNode;
};

export const InstanceStatsListing = ({
	children,
	name,
	description,
	type,
	isDeprecated,
}: InstanceStatsListingProps) => (
	<Container>
		<InstanceDescriptionTitle
			title={name}
			description={description}
			type={type}
			isDeprecated={isDeprecated}
		/>
		{children}
	</Container>
);
