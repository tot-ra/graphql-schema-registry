import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { InnerTableFourColumns } from '../../shared/styled';
import { Container } from './InstancesListing';
import { SchemasListingSkeleton } from '../schemas-listing';

const data = Array(5)
	.fill(null)
	.map((item, index) => ({
		id: index,
		schemas: index === 1 || index === 3 ? index : 0,
	}));

export const TypeListingInstancesSkeleton = () => (
	<Container>
		<Skeleton variant="rect" width="20%" height={25} />
		<TableContainer component={Paper}>
			<Table component={InnerTableFourColumns}>
				<TableHead>
					<TableRow>
						<TableCell>
							<Skeleton variant="rect" width="100%" height={25} />
						</TableCell>
						<TableCell />
						<TableCell>
							<Skeleton variant="rect" width="100%" height={25} />
						</TableCell>
						<TableCell />
					</TableRow>
				</TableHead>
				<TableBody>
					{data.map(({ id, schemas }) => (
						<TableRow key={id}>
							<TableCell>
								<Skeleton
									variant="rect"
									width="100%"
									height={25}
								/>
							</TableCell>
							<TableCell>
								<Skeleton
									variant="rect"
									width="80%"
									height={25}
								/>
							</TableCell>
							<TableCell>
								{schemas > 0 && (
									<SchemasListingSkeleton schemas={schemas} />
								)}
							</TableCell>
							<TableCell>
								<Skeleton
									variant="rect"
									width="80%"
									height={25}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	</Container>
);
