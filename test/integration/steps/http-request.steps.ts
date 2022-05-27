import { When, Then, Given } from '@cucumber/cucumber';
import fetch from 'node-fetch';
let response: any;
import expect from 'expect';
import crypto from "crypto";
import {UpdateUsageStrategy} from "../../../src/controller/clientUsage/registeredClient";
const fs = require('fs');

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
			headers: { 'Content-Type': 'application/json', 'Force-Push': true },
		});
	}
);

Given(
	'a not registered client {string} and version {string} for an {string} query:',
	async (clientName: string, clientVersion: string, isError: string, query: string) => {
		const {RegisterUsage} = await import('../../../src/controller/clientUsage/notRegisteredClient');
		const hash = crypto.createHash('md5').update(query).digest('hex');
		const strategy = new RegisterUsage(
			query,
			clientName,
			clientVersion,
			isError === 'invalid',
			hash
		)
		const result = await strategy.execute();
	}
);

Given(
	'a registered client {int} for an {string} query:',
	async (clientId: number, isError: string, query: string) => {
		const {UpdateUsageStrategy} = await import('../../../src/controller/clientUsage/registeredClient');
		const hash = crypto.createHash('md5').update(query).digest('hex');
		const strategy = new UpdateUsageStrategy(
			isError === 'invalid',
			clientId,
			hash
		)
		const result = await strategy.execute();
	}
);

Then('the response status code should be {int}', async (status: number) => {
	expect(response?.status).toEqual(status);
});

Then('the response should be in JSON and contain:', async (json) => {
	const responseBody = await response.json();
	const subObj = JSON.parse(json);
	expect(responseBody).toMatchObject(subObj);
});
