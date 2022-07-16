/* eslint-disable no-console */
const request = require('request-promise');
// const database = require('./database');

async function waitUntilServiceIsReadyOr5Min() {
	for (let i = 0; i < 50; i++) {
		try {
			const result = await request({
				method: 'GET',
				uri: 'http://localhost:6001/health',
				resolveWithFullResponse: true,
				json: true,
			});

			if (result.statusCode === 200) {
				return true;
			}
		} catch (e) {
			console.log(
				'Waiting for schema-registry to be ready on http://localhost:6001/health. Retrying in 10 sec'
			);
		}

		await new Promise((resolve) => setTimeout(resolve, 10000));
	}
}
module.exports = async function () {
	await waitUntilServiceIsReadyOr5Min();
};