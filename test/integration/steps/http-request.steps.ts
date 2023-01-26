import { When, Then, Given } from '@cucumber/cucumber';
import util from 'util';
import zlib from 'zlib';
import fetch from 'node-fetch';
import { Response } from 'node-fetch';
let response: Response;
import expect from 'expect';
import crypto from 'crypto';
import { UpdateUsageStrategy } from '../../../src/controller/clientUsage/registeredClient';
import { setDefaultTimeout } from '@cucumber/cucumber';
import { Report } from 'apollo-reporting-protobuf';

setDefaultTimeout(20 * 1000);

When(
	'I send a {string} request to {string}',
	async (op: string, url: string) => {
		response = await fetch(`http://localhost:3000${url}`, {
			method: op,
		});
	}
);

When(
	'I send a {string} request to {string} with body:',
	async (op: string, url: string, body: string) => {
		response = await fetch(`http://localhost:3000${url}`, {
			method: op,
			body: body,
			headers: { 'Content-Type': 'application/json' },
		});
	}
);

When(
	'I send a "POST" request to {string} with body and forcing header:',
	async (url: string, body: string) => {
		response = await fetch(`http://localhost:3000${url}`, {
			method: 'POST',
			body: body,
			headers: {
				'Content-Type': 'application/json',
				'Force-Push': 'true',
			},
		});
	}
);

When(
	'I send a {string} request to {string} with header {string} set to {string}',
	async (
		method: string,
		url: string,
		headerName: string,
		headerValue: string
	) => {
		response = await fetch(`http://localhost:3000${url}`, {
			method,
			headers: { [headerName]: headerValue },
		});
	}
);

Given(
	'a client named {string} with version {string} makes {int} {string} queries:',
	async (
		clientName: string,
		clientVersion: string,
		requestCount: number,
		queryStatus: 'valid' | 'invalid',
		query: string
	) => {
		const requestBody = {
			tracesPerQuery: {
				[query]: {
					trace: [
						{
							clientName,
							clientVersion,
							root:
								queryStatus === 'invalid'
									? { error: ['error'] }
									: {},
						},
					],
					statsWithContext: [
						{
							context: {
								clientName,
								clientVersion,
							},
							queryLatencyStats: {
								requestCount: `${requestCount - 1}`,
								rootErrorStats: {
									requestsWithErrorsCount: `${
										queryStatus === 'invalid'
											? requestCount - 1
											: 0
									}`,
								},
							},
						},
					],
				},
			},
			operationCount: '5',
		};

		const gzip = util.promisify(zlib.gzip);
		const gzippedBodyBuffer = await gzip(
			Report.encode(requestBody as any).finish()
		);

		response = await fetch(`http://localhost:3000/api/ingress/traces`, {
			method: 'POST',
			body: gzippedBodyBuffer,
			headers: {
				'Content-Encoding': 'gzip',
			},
		});

		expect(response.status).toEqual(200);
	}
);

Then('the response status code should be {int}', async (status: number) => {
	expect(response?.status).toEqual(status);
});

Then('the response should be in JSON and contain:', async (json) => {
	const responseBody = await response.json();
	const subObj = JSON.parse(json);
	if (responseBody.data?.added_time) {
		if (!subObj.data?.added_time) {
			subObj.data = {
				added_time: responseBody.data?.added_time,
				...subObj.data,
			};
		}
	}
	expect(responseBody).toMatchObject(subObj);
});

Then('the response should contains the text:', async (expectedResponse) => {
	const body = await response.text();
	expect(body).toContain(expectedResponse);
});
