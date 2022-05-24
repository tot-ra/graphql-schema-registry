import { EntityType, OperationType } from '../../model/enums';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { isEnum } from '../utils';
import { TypeInstanceRepository } from '../../model/repository';
import { UserInputError } from 'apollo-server-express';

export default function getTypeInstance(_parent, { type, id }) {
	const evaluatedType = type.toLowerCase();
	let repository: TypeInstanceRepository;

	if (isEnum(evaluatedType, EntityType)) {
		repository = TypeTransactionalRepository.getInstance();
	} else if (isEnum(evaluatedType, OperationType)) {
		repository = OperationTransactionalRepository.getInstance();
	} else {
		throw new UserInputError(`Unknown type: ${type}`);
	}

	return repository.getDetails(id);
}
