import { Client, ClientPayload } from '../model/client';
import { connection } from './index';
import { Knex } from 'knex';
import { BreakDownRepository } from './schemaBreakdown/breakdown';

interface ClientService {
	getClientByUnique(name: string, version: string): Promise<Client>;
	getClientByUniqueTrx(
		trx: Knex.Transaction,
		name: string,
		version: string
	): Promise<Client>;
	insertClient(client: ClientPayload): Promise<number>;
}

const TABLE_NAME = 'clients';
const TABLE_COLUMNS = ['name', 'version'];

export interface ClientDAO {
	id?: number;
	name?: string;
	version?: string;
}

export interface ClientVersion {
	id: number;
	tag: string;
}
export interface ClientDTO {
	name: string;
	versions: ClientVersion[];
}

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
		trx: Knex.Transaction,
		name: string,
		version: string
	) {
		return trx(TABLE_NAME)
			.select()
			.where('name', name)
			.andWhere('version', version)
			.first();
	}

	async getClientById(id: number) {
		return connection(TABLE_NAME).select().where('id', id).first();
	}

	async insertClient(client: ClientPayload): Promise<number> {
		return connection(TABLE_NAME).insert(client);
	}

	async getClientsByIds(ids: number[]): Promise<ClientDTO[]> {
		const clients = await connection(TABLE_NAME)
			.select()
			.whereIn('id', ids);
		return this.groupClientsByName(clients);
	}

	private groupClientsByName(clients: ClientDAO[]): ClientDTO[] {
		return clients.reduce((acc, client) => {
			const { name, id, version } = client;
			const existingClient = acc.find((c) => c.name === name);
			if (existingClient) {
				existingClient.versions.push({ id, tag: version });
			} else {
				acc.push({
					name,
					versions: [{ id, tag: version }],
				});
			}
			return acc;
		}, [] as ClientDTO[]);
	}
}
