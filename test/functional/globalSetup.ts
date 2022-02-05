import { connection } from './db';
import request from 'request-promise';

async function waitUntilDbIsReadyOr20Sec() {
	for (let i = 0; i < 20; i++) {
		if (await connection.schema.hasTable('persisted_queries')) {
			return true;
		}
		console.log('Waiting for DB to be ready ...');
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

async function waitUntilServiceIsReadyOr20Sec() {
	for (let i = 0; i < 10; i++) {
		try {
			let result = await request({
				method: 'GET',
				uri: 'http://localhost:6001/health',
				resolveWithFullResponse: true,
				json: true,
			});

			if (result.statusCode === 200) {
				return true;
			}
		} catch (e) {
			console.log('Waiting for service to be ready ...');
		}

		await new Promise((resolve) => setTimeout(resolve, 2000));
	}
}

module.exports = async function () {
	await waitUntilServiceIsReadyOr20Sec();
	// await connect();
	// await waitUntilDbIsReadyOr20Sec();
	// await disconnect();
};
