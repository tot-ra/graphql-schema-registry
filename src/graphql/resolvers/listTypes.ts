import {
	TypeTransactionalRepository,
	TypeCount,
} from '../../database/schemaBreakdown/type';
import {
	OperationTransactionalRepository,
	OperationCount,
} from '../../database/schemaBreakdown/operations';

interface ListedTypes {
	operations: OperationCount[];
	entities: TypeCount[];
}

export default async function listTypes(): Promise<ListedTypes> {
	return {
		operations:
			await OperationTransactionalRepository.getInstance().countOperationsByType(),
		entities:
			await TypeTransactionalRepository.getInstance().countTypesByType(),
	};
}
