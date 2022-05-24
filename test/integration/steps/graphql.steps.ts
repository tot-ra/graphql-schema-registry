import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Then as then, When as when } from '@cucumber/cucumber';
import expect from 'expect';
import {
	apolloServer,
	requestDataPath,
	responseDataPath,
} from '../config/config';

let response: any;

when(
	'I execute the graphQL query in file {string} with variables:',
	async (queryFile: string, variables: string) => {
		const query = readFileSync(resolve(requestDataPath, queryFile), 'utf8');
		response = await apolloServer.executeOperation({
			query,
			variables: JSON.parse(variables),
		});
	}
);

when(
	'I execute the graphQL query in file {string}',
	async (queryFile: string) => {
		const query = readFileSync(resolve(requestDataPath, queryFile), 'utf8');
		response = await apolloServer.executeOperation({ query });
	}
);

then('the response contains no errors', async () => {
	expect(response.errors).toBeUndefined();
});

then('the response contains {string} error', async (code) => {
	expect(response.errors).not.toBeUndefined();
	// eslint-disable-next-line dot-notation
	expect(response.errors)['toContainObject']({ extensions: { code } });
});

then(
	'the response contains JSON from file {string}',
	async (jsonFile: string) => {
		const expectedResponseFile = readFileSync(
			resolve(responseDataPath, jsonFile),
			'utf8'
		);
		const expectedResponse = JSON.parse(expectedResponseFile);
		expect(response).toMatchObject(expectedResponse);
	}
);
