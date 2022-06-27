import { Link } from '@material-ui/core';
import styled from 'styled-components';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { DeprecatedLabel } from '../../components/DeprecatedLabel';
import { CommonLink } from '../../components/Link';
import { NormalizedLabel } from '../../shared/styled';
import { colors } from '../../utils';

export const CustomCommonLink = styled(CommonLink)`
	display: inline-flex;
	align-items: flex-end;
	column-gap: 0.3rem;

	& > span {
		font-size: 0.9rem;
		line-height: 1rem;
	}
`;

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

const TitleContainer = styled.div`
	display: flex;
	align-items: center;
	column-gap: 1rem;
`;

type InstanceDescriptionTitleProps = {
	title: string;
	description: string;
	type: string;
	isDeprecated?: boolean;
	statsPath?: string;
};

export const InstanceDescriptionTitle = ({
	title,
	description,
	type,
	isDeprecated,
	statsPath,
}: InstanceDescriptionTitleProps) => (
	<Container>
		<TitleContainer>
			<h3>{title}</h3>
			{isDeprecated && <DeprecatedLabel />}
			{statsPath && (
				<Link
					component={CustomCommonLink}
					variant="button"
					to={statsPath}
					starIc
				>
					<EqualizerIcon titleAccess="Stats" fontSize="small" />
					<span>Stats</span>
				</Link>
			)}
		</TitleContainer>
		<p>{description}</p>
		<p>
			Kind of type:{' '}
			<CommonLink to={`/types/${type.toLowerCase()}`}>
				<NormalizedLabel>{type}</NormalizedLabel>
			</CommonLink>
		</p>
	</Container>
);
