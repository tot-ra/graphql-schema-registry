import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';

import { EntryGrid } from '../../components/styled';
import { FlexRow, VersionRow, VersionTag } from '../styled';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { List, ListItem, Tooltip } from '@material-ui/core';
import VersionCharDelta from './VersionCharDelta';

const VersionsList = ({ service }) => {
	const { serviceName, schemaId } = useParams();
	const selectedSchema = parseInt(schemaId, 10);
	let history = useHistory();

	if (!service) {
		return;
	}

	return (
		<List component="nav">
			{service.schemas.map((schema) => {
				const today = new Date();
				const date = new Date(schema.addedTime);
				const icon = schema.isDev ? (
					<Tooltip
						placement="right"
						title="Registered by service in dev mode"
					>
						<DeveloperModeIcon />
					</Tooltip>
				) : (
					<ChevronRightIcon />
				);

				return (
					<ListItem
						button
						key={schema.id}
						selected={selectedSchema === schema.id}
						className={schema.isActive ? '' : 'deleted'}
						onClick={() =>
							history.push(`/${serviceName}/${schema.id}`)
						}
					>
						<EntryGrid>
							<div>
								<FlexRow>
									<VersionTag>#{schema.id}</VersionTag>
									<VersionCharDelta
										selected={selectedSchema === schema.id}
										schema={schema}
									/>
								</FlexRow>
								<VersionRow
									selected={selectedSchema === schema.id}
								>
									<span>
										added{' '}
										{formatDistance(date, today, {
											addSuffix: true,
										})}
									</span>
								</VersionRow>
							</div>
							{icon}
						</EntryGrid>
					</ListItem>
				);
			})}
		</List>
	);
};

export default VersionsList;
