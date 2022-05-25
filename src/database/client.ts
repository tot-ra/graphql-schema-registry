interface ClientService {
	getClientByUnique(name: string, version: string): Client;
}

export class ClientRepository implements ClientService {
	getClientByUnique(name: string, version: string): Client {
		return undefined;
	}

}
