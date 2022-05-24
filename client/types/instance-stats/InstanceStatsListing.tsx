import React from 'react';
import styled from 'styled-components';
import { TypeInstanceStatsOutput } from '../../utils/queries';
import { InstanceDescriptionTitle } from '../instance-description/InstanceDescriptionTitle';
import { InstanceStatsClient } from './InstanceStatsClient';

export const Container = styled.section`
	row-gap: 2rem;
	display: flex;
	flex-direction: column;
`;

const ClientsList = styled.ul`
	display: grid;
	row-gap: 2rem;
	padding: 0;
	margin: 0;
	list-style: none;
`;

type InstanceStatsListingProps = Omit<
	TypeInstanceStatsOutput['getTypeInstance'],
	'id'
> & {
	items: TypeInstanceStatsOutput['getUsageTrack'];
};

export const InstanceStatsListing = ({
	items,
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
		{items.length === 0 && <span>No clients :(</span>}
		{items.length > 0 && (
			<ClientsList>
				{items.map(({ client }) => (
					<InstanceStatsClient key={client.name} client={client} />
				))}
			</ClientsList>
		)}
	</Container>
);
