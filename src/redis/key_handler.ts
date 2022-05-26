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

	getSuccessExecutionsKeyPattern(input: ExecutionsInput) {
		return `${this.prefixes.success}${this.getExecutionsKeyPattern(input)}`;
	}

	getErrorExecutionsKeyPattern(input: ExecutionsInput) {
		return `${this.prefixes.error}${this.getExecutionsKeyPattern(input)}`;
	}

	private getExecutionsKeyPattern(input: ExecutionsInput) {
		const startSeconds = Math.floor(input.startDate.getTime() / 1000);
		const endSeconds = Math.floor(input.endDate.getTime() / 1000);
		const differenceSeconds = (endSeconds - startSeconds).toString().length;
		const commonSeconds = startSeconds
			.toString()
			.slice(0, -differenceSeconds);

		return `*_${input.hash}_${commonSeconds}*}`;
	}
}
