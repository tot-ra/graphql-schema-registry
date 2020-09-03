import React from 'react';

export const GlobalConfigContext = React.createContext();

class GlobalConfig {
	get grapqhlEndpoint() {
		return `${this.host}${this.graphqlPath}`;
	}

	get host() {
		throw new Error('Not implemented');
	}

	get graphqlPath() {
		throw new Error('Not implemented');
	}

	get env() {
		throw new Error('Not implemented');
	}
}

class BackofficeConfig extends GlobalConfig {
	constructor(backofficeApi) {
		super();
		this.api = backofficeApi;
	}

	get host() {
		const host = this.api.globalConfig.api_host;
		const port = this.api.globalConfig.api_port;

		return `${host}:${port}`;
	}

	get graphqlPath() {
		return '/schema-registry-graphql';
	}

	get env() {
		return this.api.globalConfig.env;
	}
}

class StandaloneConfig extends GlobalConfig {
	get host() {
		return `${window.location.protocol}//${window.location.host}`;
	}

	get graphqlPath() {
		return '/graphql';
	}

	get env() {
		return 'dev';
	}
}

export function createConfig(api) {
	return api ? new BackofficeConfig(api) : new StandaloneConfig();
}
