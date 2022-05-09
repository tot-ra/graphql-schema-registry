import { List, ListItem, ListItemText } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import React, { ReactNode, useCallback, useState } from 'react';
import {
	NavLinkProps as ReactRouterNavLinkProps,
	NavLink as ReactRouterNavLink,
} from 'react-router-dom';
import styled from 'styled-components';
import { colors } from '../utils';

export const EmptyList = styled.section`
	padding: 1rem;
	display: flex;
	justify-content: center;
	align-items: center;
	user-select: none;
`;

export const ListContainer = styled.section`
	overflow: auto;

	& > :not(:last-child) {
		border-bottom: 1px solid ${colors.black.hex256};
	}
`;

type NavigationListItemProps = {
	href: string;
	value: ReactNode;
	showNavigationChevron?: boolean;
};

export const NavigationListItem = ({
	href,
	value,
	showNavigationChevron = true,
}: NavigationListItemProps) => {
	const [active, setActive] = useState(false);
	const isActive = useCallback((match) => {
		setActive(!!match);
		return match;
	}, []);

	const CustomLink = React.useMemo(
		() =>
			React.forwardRef<
				HTMLAnchorElement,
				Omit<ReactRouterNavLinkProps, 'to'>
			>(function Link(linkProps, ref) {
				return (
					<ReactRouterNavLink
						ref={ref}
						to={href}
						isActive={isActive}
						{...linkProps}
					/>
				);
			}),
		[href, isActive]
	);

	return (
		<ListItem button component={CustomLink} selected={active}>
			<ListItemText primary={value} />
			{showNavigationChevron && <ChevronRightIcon />}
		</ListItem>
	);
};

type NavigationListProps = {
	children: ReactNode | ReactNode[];
};

export const NavigationList = ({ children }: NavigationListProps) => (
	<List component="nav" disablePadding>
		{children}
	</List>
);
