export interface KeyHandlerService {
	createClientUsageKey(clientId: number, query: String): String;
	createCounterKey(clientId: number, query: String): String;
}

export class KeyHandler implements KeyHandlerService {
	createClientUsageKey(clientId: number, query: String): String {
		return "";
	}

	createCounterKey(clientId: number, query: String): String {
		return "";
	}
}
