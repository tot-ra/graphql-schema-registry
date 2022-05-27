import { ExecutionsInput } from './redis';

export interface KeyHandlerService {
	createClientUsageKey(clientId: number, query: String): String;
	createCounterKey(clientId: number, query: String): String;
}

export class KeyHandler implements KeyHandlerService {
	public prefixes = {
		operation: 'o_',
		success: 's_',
		error: 'e_',
	};

	allClientUsageKey(): String {
		return '';
	}

	createClientUsageKey(clientId: number, query: String): String {
		return 'clientid_hash';
	}

	createCounterKey(clientId: number, query: String): String {
		return '';
	}

	parseOperationKey(key: string) {
		const pattern = /^[^_\W]+_([^_\W]+)_([^_\W]+)/i;
		const [clientId, hash] = key.match(pattern).slice(1);
		return {
			clientId,
			hash,
		};
	}

	getDateSecondsFromKey(key: string): number {
		const pattern = /_([0-9]+)$/;
		const [dateSeconds] = key.match(pattern).slice(1);
		return parseInt(dateSeconds, 10);
	}

	getExecutionsKeyPattern(input: ExecutionsInput, type: 'error' | 'success') {
		const prefix =
			type === 'error' ? this.prefixes.error : this.prefixes.success;
		const differenceSeconds = (
			input.endSeconds - input.startSeconds
		).toString().length;
		const commonSeconds = input.startSeconds
			.toString()
			.slice(0, -differenceSeconds);

		return `${prefix}*_${input.hash}_${commonSeconds}*}`;
	}
}
