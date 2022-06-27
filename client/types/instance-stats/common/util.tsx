import React from 'react';
import { InnerTable } from '../../../shared/styled';

export const getInnerInstanceStatsTable = (showUsageDetail: boolean) =>
	React.forwardRef<
		HTMLTableElement,
		React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLTableElement>,
			HTMLTableElement
		>
	>(function InnerTableFourColumns(props, ref) {
		return (
			<InnerTable
				columnsWidth={
					showUsageDetail ? [55, 15, 12.5, 12.5, 5] : [55, 15, 15, 15]
				}
				{...props}
				ref={ref}
			/>
		);
	});
