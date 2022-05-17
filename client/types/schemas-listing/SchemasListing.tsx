import { List, ListItem, ListItemIcon, makeStyles } from '@material-ui/core';
import Icon from '@material-ui/icons/InsertLinkOutlined';
import { CommonLink } from '../../components/Link';
import { TypeInstancesOutput } from '../../utils/queries';

const useStyles = makeStyles({
	icon: {
		minWidth: '30px',
	},
});

type SchemasListingsProps = {
	schemas: TypeInstancesOutput['listTypeInstances']['items'][0]['providedBy'];
};

export const SchemasListing = ({ schemas }: SchemasListingsProps) => {
	const styles = useStyles();
	return (
		<List component="nav" disablePadding dense>
			{schemas.map(({ name }) => (
				<ListItem
					disableGutters
					key={name}
					component={CommonLink}
					to={`/schema/${name}`}
				>
					<ListItemIcon className={styles.icon}>
						<Icon fontSize="small" />
					</ListItemIcon>
					{name}
				</ListItem>
			))}
		</List>
	);
};
