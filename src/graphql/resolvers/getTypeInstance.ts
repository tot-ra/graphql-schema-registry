import { EntityType, OperationType } from '../../model/enums';
import TypeTransactionalRepository from '../../database/schemaBreakdown/type';
import OperationsRepository from '../../database/schemaBreakdown/operations';
import { isEnum } from '../utils';
import { TypeInstanceRepository } from '../../model/repository';
import { GraphQLError } from 'graphql';

function a(repository: TypeInstanceRepository, id: number) {
	repository.getDetails(id);
}

export default function getTypeInstance(_parent, { type, id }) {
	const evaluatedType = type.toLowerCase();
	let repository: TypeInstanceRepository;

	if (isEnum(evaluatedType, EntityType)) {
		repository = TypeTransactionalRepository;
	} else if (isEnum(evaluatedType, OperationType)) {
		repository = OperationsRepository;
	} else {
		throw new GraphQLError(`Unknown type: ${type}`);
	}

	return a(repository, id);
}
