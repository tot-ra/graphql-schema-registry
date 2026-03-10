const DEFAULT_TIMEOUT_MS = 1500;
const DEFAULT_CACHE_TTL_MS = 30000;

type ServiceHealthStatus = 'UP' | 'DOWN';

type CacheEntry = {
	status: ServiceHealthStatus;
	expiresAt: number;
};

const healthCache = new Map<string, CacheEntry>();
const inFlightChecks = new Map<string, Promise<ServiceHealthStatus>>();

function getProbeTimeoutMs() {
	const value = Number(process.env.SERVICE_HEALTH_TIMEOUT_MS);
	return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

function getCacheTtlMs() {
	const value = Number(process.env.SERVICE_HEALTH_CACHE_TTL_MS);
	return Number.isFinite(value) && value > 0 ? value : DEFAULT_CACHE_TTL_MS;
}

async function probeService(url: string): Promise<ServiceHealthStatus> {
	if (!url) {
		return 'DOWN';
	}

	const normalizedUrl = normalizeServiceUrl(url);
	if (!normalizedUrl) {
		return 'DOWN';
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), getProbeTimeoutMs());

	try {
		const response = await fetch(normalizedUrl, {
			method: 'POST',
			signal: controller.signal,
			redirect: 'follow',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				query: 'query ServiceHealthCheck { __typename }',
				operationName: 'ServiceHealthCheck',
			}),
		});

		// If we got an HTTP response at all (including auth or validation errors),
		// the service is reachable. Only transport failures/timeouts are DOWN.
		if (response.status >= 100 && response.status < 500) {
			return 'UP';
		}

		return response.status >= 500 ? 'DOWN' : 'UP';
	} catch {
		return 'DOWN';
	} finally {
		clearTimeout(timeout);
	}
}

function normalizeServiceUrl(url: string): string | null {
	try {
		return new URL(url).toString();
	} catch {
		try {
			return new URL(`http://${url}`).toString();
		} catch {
			return null;
		}
	}
}

export async function getServiceHealthStatus(
	url: string
): Promise<ServiceHealthStatus> {
	const now = Date.now();
	const cached = healthCache.get(url);

	if (cached && cached.expiresAt > now) {
		return cached.status;
	}

	const pending = inFlightChecks.get(url);
	if (pending) {
		return pending;
	}

	const probePromise = probeService(url)
		.then((status) => {
			healthCache.set(url, {
				status,
				expiresAt: Date.now() + getCacheTtlMs(),
			});
			return status;
		})
		.finally(() => {
			inFlightChecks.delete(url);
		});

	inFlightChecks.set(url, probePromise);

	return probePromise;
}
