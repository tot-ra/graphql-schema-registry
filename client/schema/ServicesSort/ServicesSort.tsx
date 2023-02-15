import React from 'react';
import { TableSortLabel } from '@material-ui/core';

import { Sort, SortField } from '../types';
import { StyledContainer } from './styles';

interface ServicesSortProps {
	setSort: (sort: SortField) => void;
	sort: Sort;
}

export const ServicesSort: React.FC<ServicesSortProps> = ({
	sort,
	setSort,
}) => {
	return (
		<StyledContainer>
			<TableSortLabel
				active
				direction={sort[SortField.NAME].toLowerCase() as 'asc' | 'desc'}
				onClick={() => setSort(SortField.NAME)}
			>
				{'Name'}
			</TableSortLabel>
			<TableSortLabel
				active
				direction={
					sort[SortField.ADDEDD_TIME].toLowerCase() as 'asc' | 'desc'
				}
				onClick={() => setSort(SortField.ADDEDD_TIME)}
			>
				{'Added time'}
			</TableSortLabel>
		</StyledContainer>
	);
};
