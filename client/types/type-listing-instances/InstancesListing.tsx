import {
	makeStyles,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';
import styled from 'styled-components';
import { CommonLink } from '../../components/Link';
import { colors } from '../../utils';
import { TypeInstancesOutput } from '../../utils/queries';
import { InstancesListingTitle } from './InstancesListingTitle';
import { SchemasListing } from './SchemasListing';

const useStyles = makeStyles({
	container: {},
	description: {
		color: colors.black.hex32,
	},
});

export const Container = styled.section`
	display: grid;
	grid-template-rows: auto 1fr;
	row-gap: 2rem;
`;

export const InnerTable = styled.table`
	width: 100%;
	table-layout: fixed;

	th:first-child {
		width: 15%;
	}

	th:nth-child(2) {
		width: 70%;
		text-align: justify;
	}

	th:last-child {
		width: 15%;
	}
`;

type InstancesListingProps = {
	typeName: string;
	items: TypeInstancesOutput['listTypeInstances']['items'];
};

export const InstancesListing = ({
	typeName,
	items,
}: InstancesListingProps) => {
	const styles = useStyles();
	return (
		<Container>
			<InstancesListingTitle>{typeName}</InstancesListingTitle>
			<TableContainer component={Paper}>
				<Table component={InnerTable}>
					<TableHead>
						<TableRow>
							<TableCell>Types</TableCell>
							<TableCell />
							<TableCell>Schemas</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map((item) => (
							<TableRow key={item.id}>
								<TableCell component="th" scope="row">
									<CommonLink
										to={`/types/${item.type}/${item.id}`}
									>
										<strong>{item.name}</strong>
									</CommonLink>
								</TableCell>
								<TableCell>
									<span className={styles.description}>
										{item.description ?? (
											<i>No description</i>
										)}
									</span>
								</TableCell>
								<TableCell>
									{item.providedBy.length > 0 && (
										<SchemasListing
											schemas={item.providedBy}
										/>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
};
