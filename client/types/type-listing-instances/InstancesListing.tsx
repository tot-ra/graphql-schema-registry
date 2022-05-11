import {
	makeStyles,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TablePagination,
	TableRow,
} from '@material-ui/core';
import styled from 'styled-components';
import { CommonLink } from '../../components/Link';
import { colors } from '../../utils';
import { InstancesListingTitle } from './InstancesListingTitle';
import { SchemasListing } from './SchemasListing';
import { ListTypeInstances } from '../../utils/queries';

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

interface InstancesListingProps extends ListTypeInstances {
	typeName: string;
	onPageChange: (newPage: number) => void;
	onRowsPerPageChange: (rowsPerPage: number) => void;
}

export const InstancesListing = ({
	typeName,
	items,
	pagination,
	onPageChange,
	onRowsPerPageChange,
}: InstancesListingProps) => {
	const styles = useStyles();

	const handleChangePage = (
		event: React.MouseEvent<HTMLButtonElement> | null,
		newPage: number
	) => {
		onPageChange(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		onRowsPerPageChange(parseInt(event.target.value, 10));
	};

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
					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={[10, 15, 25]}
								count={pagination.totalPages}
								rowsPerPage={pagination.limit}
								page={pagination.page}
								SelectProps={{
									inputProps: {
										'aria-label': 'rows per page',
									},
									native: true,
								}}
								onPageChange={handleChangePage}
								onRowsPerPageChange={handleChangeRowsPerPage}
							/>
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>
		</Container>
	);
};
