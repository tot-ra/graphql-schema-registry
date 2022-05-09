import {Operation, OperationPayload} from "../../model/operation";
import {OperationRepository} from "../../database/schemaBreakdown/operations";
import {transact} from "../../database";

export async function insertOperation(data: OperationPayload): Promise<Operation> {
	const repository = new OperationRepository();
	return await transact(async (trx) => {
		return repository.insertOperation(trx, data)
	});
}
