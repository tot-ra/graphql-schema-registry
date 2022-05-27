import { Client, ClientPayload } from '../model/client';
import { connection } from './index';
import { Transaction } from 'knex';
import { BreakDownRepository } from './schemaBreakdown/breakdown';

interface ClientService {
	getClientByUnique(name: string, version: string): Promise<Client>;
	getClientByUniqueTrx(
		trx: Transaction,
		name: string,
		version: string
	): Promise<Client>;
	insertClient(trx: Transaction, client: ClientPayload): Promise<number>;
}

const TABLE_NAME = 'clients';
const TABLE_COLUMNS = ['name', 'version'];

export class ClientRepository
	extends BreakDownRepository<ClientPayload, Client>
	implements ClientService
{
	private static instance: ClientRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): ClientRepository {
		if (!ClientRepository.instance) {
			ClientRepository.instance = new ClientRepository();
		}

		return ClientRepository.instance;
	}

	async getClientByUnique(name: string, version: string) {
		return connection(TABLE_NAME)
			.select()
			.where('name', name)
			.andWhere('version', version)
			.first();
	}

	async getClientByUniqueTrx(
		trx: Transaction,
		name: string,
		version: string
	) {
		return trx(TABLE_NAME)
			.select()
			.where('name', name)
			.andWhere('version', version)
			.first();
	}

	async insertClient(
		trx: Transaction,
		client: ClientPayload
	): Promise<number> {
		return super.insert(trx, [client]);
	}
}
