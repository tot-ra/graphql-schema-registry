import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { print } from 'graphql';

const packageJson = JSON.parse(
	fs.readFileSync(path.resolve('package.json'), 'utf8')
);

async function postData(url = '', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(data), // body data type must match "Content-Type" header
	});
	return await response.json(); // parses JSON response into native JavaScript objects
}

export async function registerSchema(schema) {
	const result = await postData('http://localhost:6001/schema/push', {
		name: packageJson.name,
		version: packageJson.version, // if possible, use DOCKER image hash instead, git commit or other auto-updateable value
		type_defs: print(schema),
	});

	console.info(result);
}
