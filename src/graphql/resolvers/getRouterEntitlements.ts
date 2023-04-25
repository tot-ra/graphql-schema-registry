import { FetchError } from 'node-fetch';
import { DEFAULT_SUPER_GRAPH_MIN_DELAY_SECONDS } from './getRouterConfig';

interface RouterEntitlementsParams {
	ref: string;
	apiKey: string;
	ifAfterId: string;
	unlessId: string;
}

enum RouterEntitlementAudience {
	SELF_HOSTED = 'SELF_HOSTED',
	CLOUD = 'CLOUD',
}

interface RouterEntitlement {
	jwt: string;
	subject: string;
	audience: RouterEntitlementAudience[];
	haltAt: Date;
	warnAt: Date;
}

interface RouterEntitlementsResult {
	id: string;
	minDelaySeconds: number;
	entitlement: RouterEntitlement;
}

type Unchanged = Omit<RouterEntitlementsResult, 'entitlement'>;

type GetRouterEntitlements = RouterEntitlementsResult | Unchanged | FetchError;

export default (
	_,
	{ ifAfterId }: RouterEntitlementsParams
): GetRouterEntitlements => {
	const minDelaySeconds = process.env.SUPER_GRAPH_MIN_DELAY_SECONDS
		? parseInt(process.env.SUPER_GRAPH_MIN_DELAY_SECONDS, 10)
		: DEFAULT_SUPER_GRAPH_MIN_DELAY_SECONDS;

	return {
		id: ifAfterId ? 'not-changed' : 'new',
		minDelaySeconds,
		entitlement: null,
	};
};
