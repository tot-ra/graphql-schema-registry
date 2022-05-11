import TypeTransactionalRepository from '../../database/schemaBreakdown/type';
import OperationsRepository from '../../database/schemaBreakdown/operations';
import { EntityType, OperationType } from '../../model/enums';
import { getPagination, isOffsetOutbounds as isPageOutbounds, Pagination } from '../resolvers';
import { Operation } from '../../model/operation';
import { Type } from '../../model/type';
import { TypeInstanceRepository } from '../../model/repository';

interface ListedTypeInstances {
	items: Type[] | Operation[];
	pagination: Pagination;
}

async function listPaginatedInstances(
	repository: TypeInstanceRepository,
	evaluatedType: string,
	limit: number,
	offset: number
) {
	const totalItems = await repository.countByType(evaluatedType);
	let pagination = getPagination(limit, offset, totalItems);
    let safeOffset = offset;
	if (isPageOutbounds(pagination)) {
        pagination = {...pagination, page: 1}
        safeOffset = 0;
    }

	return {
		pagination,
        items: await repository.listByType(evaluatedType, limit, safeOffset),
	};
}

const isEnum = (value: String, targetEnum) =>
	Object.values(targetEnum).includes(value);

export default async function listTypeInstances(
	_parent,
	{ type, limit, offset }
): Promise<ListedTypeInstances> {
	const evaluatedType = type.toLowerCase();
	let repository: TypeInstanceRepository;

	if (isEnum(evaluatedType, EntityType)) {
		repository = TypeTransactionalRepository;
	} else if (isEnum(evaluatedType, OperationType)) {
		repository = OperationsRepository;
	} else {
		throw new Error(`Unknown type: ${type}`);
	}

	return listPaginatedInstances(repository, evaluatedType, limit, offset);
}
