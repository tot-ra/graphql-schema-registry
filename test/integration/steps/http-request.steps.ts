import { When, Then, Given } from '@cucumber/cucumber';
import fetch from 'node-fetch';
let response: any;
import expect from 'expect';
import zlib from "zlib";
const { Report } = require('apollo-reporting-protobuf');
const {gzip} = require('node-gzip');

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
			body,
			headers: { 'Content-Type': 'application/json' },
		});
	}
);

When(
	'I send a "POST" request to {string} with body and forcing header:',
	async (url: string, body: string) => {
		response = await fetch(`http://localhost:3000${url}`, {
			method: 'POST',
			body,
			headers: { 'Content-Type': 'application/json', 'Force-Push': true },
		});
	}
);

Given('a trace on {string} for client {string} and version {string} with schema:',
	async (url: string, clientName: string, clientVersion: string, query: string) => {
		const message = Report.encode(query).finish();
		const compressed = await new Promise<Buffer>((resolve, reject) => {
			const messageBuffer = Buffer.from(
				message.buffer as ArrayBuffer,
				message.byteOffset,
				message.byteLength,
			);

			zlib.gzip(messageBuffer, (err, buffer) => {
				if (err) {
					reject(err);
				} else {
					resolve(buffer)
				}
			})
		});

		response = await fetch(`http://localhost:3000${url}`, {
			method: 'POST',
			body: compressed,
			headers: {
				'content-encoding': 'gzip',
				accept: 'application/json',
				'apollographql-client-name': clientName,
				'apollographql-client-version': clientVersion
			},
		});
});

Then('the response status code should be {int}', async (status: number) => {
	expect(response?.status).toEqual(status);
});

Then('the response should be in JSON and contain:', async (json) => {
	const responseBody = await response.json();
	const subObj = JSON.parse(json);
	expect(responseBody).toMatchObject(subObj);
});
