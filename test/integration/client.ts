const request = require('request-promise-native');
const { discovery, services } = require('./discovery');

exports.baseUrl = async () => {
	const { host, port } = await discovery(services.app);

	return `http://${host}:${port}`;
};

exports.request = async function ({ url = '/', body = {}, method, ...opts }) {
	const qs = method === 'POST' ? {} : body;

	return request({
		baseUrl: await exports.baseUrl(),
		url,
		qs,
		method,
		body,
		json: true,
		resolveWithFullResponse: true,
		simple: false,
		timeout: 10000,
		...opts,
	});
};

exports.get = async function ({ url = '/', qs = {}, ...opts }) {
	const { host, port } = await discovery(services.app);

	return request({
		baseUrl: `http://${host}:${port}`,
		url,
		qs,
		method: 'GET',
		resolveWithFullResponse: true,
		simple: false,
		timeout: 10000,
		...opts,
	});
};

exports.pushSchema = (body, opts) =>
	exports.request({ url: '/schema/push', body, method: 'POST', ...opts });

exports.validateSchema = (body, opts) =>
	exports.request({ url: '/schema/validate', body, method: 'POST', ...opts });

exports.composeSchema = (body, opts) =>
	exports.request({ url: '/schema/compose', body, method: 'POST', ...opts });

// persisted queries
exports.persistedQueriesGet = (body, opts) =>
	exports.request({ url: '/persisted_query', body, method: 'GET', ...opts });

exports.persistedQueriesPost = (body, opts) =>
	exports.request({ url: '/persisted_query', body, method: 'POST', ...opts });
