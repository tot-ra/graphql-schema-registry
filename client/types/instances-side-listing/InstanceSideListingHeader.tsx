import { Chip, Typography } from '@material-ui/core';
import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { CommonLink } from '../../components/Link';
import { NormalizedLabel } from '../../shared/styled';

const Header = styled.header`
	padding: 1rem 16px;

	background-color: #fff;

	h6 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	a {
		display: flex;
		flex-direction: row;
		column-gap: 1rem;
		align-items: center;
	}
`;

type InstanceSideListingHeaderProps = {
	typeName: string;
	counting: number;
};

export const InstanceSideListingHeader = ({
	typeName,
	counting,
}: InstanceSideListingHeaderProps) => {
	const history = useHistory();
	const { state } = useLocation<boolean>();

	const onNavigate: React.MouseEventHandler = useCallback(
		(event) => {
			if (state) {
				event.preventDefault();
				history.goBack();
			}
		},
		[history, state]
	);

	return (
		<Header>
			<Typography variant="h6">
				<CommonLink
					to={`/types/${typeName.toLowerCase()}`}
					onClick={onNavigate}
				>
					<ArrowBackIcon />
					<NormalizedLabel>{typeName}</NormalizedLabel>
				</CommonLink>
				<Chip label={counting} size="small" color="default" />
			</Typography>
		</Header>
	);
};
