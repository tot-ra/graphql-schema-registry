import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';

import { EntryPanel, EntryGrid } from '../../components/styled';
import { VersionRow, VersionTag } from '../styled';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const VersionsList = ({ service }) => {
	const { serviceName, schemaId } = useParams();
	const selectedSchema = parseInt(schemaId, 10);

	if (!service) {
		return;
	}

	return (
		<>
			{service.schemas.map((schema) => {
				const today = new Date();
				const date = new Date(schema.addedTime);
				const icon = schema.isDev ? (
					<Tooltip
						placement="right"
						content={<span>Registered by service in dev mode</span>}
					>
						<DeveloperModeIcon />
					</Tooltip>
				) : (
					<ChevronRightIcon />
				);

				return (
					<Link key={schema.id} to={`/${serviceName}/${schema.id}`}>
						<EntryPanel
							selected={selectedSchema === schema.id}
							className={schema.isActive ? '' : 'deleted'}
						>
							<EntryGrid>
								<div>
									<VersionTag>#{schema.id}</VersionTag>
									<VersionRow selected={selectedSchema === schema.id}>
										<span>
											added {formatDistance(date, today, { addSuffix: true })}
										</span>
									</VersionRow>
								</div>
								{icon}
							</EntryGrid>
						</EntryPanel>
					</Link>
				);
			})}
		</>
	);
};

export default VersionsList;
