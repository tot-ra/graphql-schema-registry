import styled from 'styled-components';
import { CommonLink } from '../../components/Link';
import { colors } from '../../utils';

export const Container = styled.header`
	display: grid;
	grid-template-rows: repeat(3, auto);
	row-gap: 1rem;

	* {
		margin: 0;
	}

	h3 {
		text-transform: capitalize;
	}

	p:nth-child(2) {
		font-size: 0.9rem;
		text-align: justify;
		color: ${colors.black.hex24};
	}

	p:nth-child(3) {
		font-weight: normal;
		font-size: 0.85rem;
		color: ${colors.black.hex64};
	}
`;

type InstanceDescriptionTitleProps = {
	title: string;
	description: string;
	type: string;
};

export const InstanceDescriptionTitle = ({
	title,
	description,
	type,
}: InstanceDescriptionTitleProps) => (
	<Container>
		<h3>{title}</h3>
		<p>{description}</p>
		<p>
			Kind of type:{' '}
			<CommonLink to={`/types/${type.toLowerCase()}`}>{type}</CommonLink>
		</p>
	</Container>
);
