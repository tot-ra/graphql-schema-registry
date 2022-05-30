import { useParams } from 'react-router-dom';
import { formatDistance } from 'date-fns';

import { EntryGrid } from '../../components/styled';
import { FlexRow, VersionRow, VersionTag } from '../styled';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import { Tooltip } from '@material-ui/core';
import VersionCharDelta from './VersionCharDelta';
import {
	ListContainer,
	NavigationList,
	NavigationListItem,
} from '../../components/List';

const VersionsList = ({ service }) => {
	const { serviceName, schemaId } = useParams();
	const selectedSchema = parseInt(schemaId, 10);

	if (!service) {
		return;
	}

	return (
		<ListContainer>
			<NavigationList>
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
					) : null;

					return (
						<NavigationListItem
							button
							key={schema.id}
							className={schema.isActive ? '' : 'deleted'}
							href={`/schema/${serviceName}/${schema.id}`}
							showNavigationChevron={!schema.isDev}
							value={
								<EntryGrid>
									<div>
										<FlexRow>
											<VersionTag>
												#{schema.id}
											</VersionTag>
											<VersionCharDelta
												selected={
													selectedSchema === schema.id
												}
												schema={schema}
											/>
										</FlexRow>
										<VersionRow
											selected={
												selectedSchema === schema.id
											}
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
							}
						/>
					);
				})}
			</NavigationList>
		</ListContainer>
	);
};

export default VersionsList;
