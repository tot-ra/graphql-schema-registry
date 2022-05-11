import TypeTransactionalRepository, { TypeCount } from '../../database/schemaBreakdown/type';
import OperationsRepository, { OperationCount } from '../../database/schemaBreakdown/operations';

interface ListedTypes {
    operations: OperationCount[];
    entities: TypeCount[];
}

export default async function listTypes(): Promise<ListedTypes> {
	return {
		operations: await OperationsRepository.countOperationsByType(),
		entities: await TypeTransactionalRepository.countTypesByType(),
	};
}
