import TypeTransactionalRepository from '../../database/schemaBreakdown/type';
import OperationsRepository from '../../database/schemaBreakdown/operations';
import { EntityType, OperationType } from '../../model/enums';
import { getPaginatedResult, Pagination } from '../resolvers';
import { TypeInstance, TypeInstanceRepository } from '../../model/repository';
import { GraphQLError } from 'graphql';

interface ListedTypeInstances {
	items: TypeInstance[];
	pagination: Pagination;
}

async function listPaginatedInstances(
	repository: TypeInstanceRepository,
	evaluatedType: string,
	limit: number,
	offset: number
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
				safeOffset
			),
		})
	);
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
		throw new GraphQLError(`Unknown type: ${type}`);
	}

	return listPaginatedInstances(repository, evaluatedType, limit, offset);
}
