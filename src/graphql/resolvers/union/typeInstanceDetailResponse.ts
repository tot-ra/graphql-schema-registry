import {
	OperationInstanceDetail,
	TypeInstanceDetail,
} from '../../../model/repository';

export default {
	__resolveType: (obj: TypeInstanceDetail | OperationInstanceDetail) => {
		if (obj['outputParams'] === undefined) {
			return 'TypeInstanceDetail';
		}
		return 'OperationInstanceDetail';
	},
};
