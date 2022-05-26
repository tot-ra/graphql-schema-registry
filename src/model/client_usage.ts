interface ClientOperationEntity {
	objectId: number;
	fields: number[];
}

interface ClientOperation {
	id: number;
	entities: ClientOperationEntity[];
}

interface ClientQuery {
	name: string;
	sdl: string;
}

export interface ClientOperationDAO {
	query: ClientQuery;
	operations: ClientOperation[];
}
