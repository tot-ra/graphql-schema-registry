import { When, Then } from '@cucumber/cucumber';
import fetch from 'node-fetch';
let response: any;
import expect from 'expect';

When('I send a "POST" request to {string} with body:', async (url: string, body: string) => {
	response = await fetch(`http://localhost:3000${url}`, {
		method: 'POST',
		body,
		headers: {'Content-Type': 'application/json'}
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
