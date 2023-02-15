import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { EntityType, OperationType } from '../../model/enums';
import {
	Order,
	TypeInstance,
	TypeInstanceRepository,
} from '../../model/repository';
import { getPaginatedResult, isEnum, Pagination } from '../utils';
import { UserInputError } from 'apollo-server-express';

interface ListedTypeInstances {
	items: TypeInstance[];
	pagination: Pagination;
}

async function listPaginatedInstances(
	repository: TypeInstanceRepository,
	evaluatedType: string,
	limit: number,
	offset: number,
	order: Order
) {
	const totalItems = await repository.countByType(evaluatedType);

	return await getPaginatedResult<Promise<{ items: TypeInstance[] }>>(
		totalItems,
		limit,
		offset,
		async (safeOffset: number) => ({
			items: await repository.listByType(
				evaluatedType,
				limit,
				safeOffset,
				order
			),
		})
	);
}

export default async function listTypeInstances(
	_parent,
	{ type, limit, offset, order = Order.ASC }
): Promise<ListedTypeInstances> {
	const evaluatedType = type.toLowerCase();
	let repository: TypeInstanceRepository;

	if (isEnum(evaluatedType, EntityType)) {
		repository = TypeTransactionalRepository.getInstance();
	} else if (isEnum(evaluatedType, OperationType)) {
		repository = OperationTransactionalRepository.getInstance();
	} else {
		throw new UserInputError(`Unknown type: ${type}`);
	}

	return listPaginatedInstances(
		repository,
		evaluatedType,
		limit,
		offset,
		order
	);
}
