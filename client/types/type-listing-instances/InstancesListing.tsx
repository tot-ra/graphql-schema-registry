import {
	Link,
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
import { InstancesListingTitle } from './InstancesListingTitle';
import SchemasListing from '../schemas-listing';
import { ListTypeInstances } from '../../utils/queries';
import { InnerTableFourColumns } from '../../shared/styled';

export const Container = styled.section`
	display: grid;
	grid-template-rows: auto 1fr;
	row-gap: 1rem;
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
				<Table component={InnerTableFourColumns}>
					<TableHead>
						<TableRow>
							<TableCell>Types</TableCell>
							<TableCell />
							<TableCell>Schemas</TableCell>
							<TableCell />
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map((item) => (
							<TableRow key={item.id}>
								<TableCell component="th" scope="row">
									<CommonLink
										to={{
											pathname: `/types/${item.type.toLowerCase()}/${
												item.id
											}`,
											state: true,
										}}
									>
										<strong>{item.name}</strong>
									</CommonLink>
								</TableCell>
								<TableCell>
									<span>
										{item.description ?? (
											<i>No description</i>
										)}
									</span>
								</TableCell>
								<TableCell component="th" scope="row">
									{item.providedBy.length > 0 && (
										<SchemasListing
											schemas={item.providedBy}
										/>
									)}
								</TableCell>
								<TableCell>
									<Link
										component={CommonLink}
										variant="button"
										to={`/types/${item.type.toLowerCase()}/${
											item.id
										}/stats`}
									>
										Stats
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={[10, 15, 25]}
								count={pagination.total}
								rowsPerPage={pagination.limit}
								page={pagination.page - 1}
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
