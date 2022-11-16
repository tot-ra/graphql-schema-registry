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

async function waitUntilServiceIsReadyOr5Min() {
	for (let i = 0; i < 300; i++) {
		try {
			let result = await request({
				method: 'GET',
				uri: 'http://localhost:6001/health',
				resolveWithFullResponse: true,
				json: true,
			});

			if (result.statusCode === 200) {
				console.log('Service looks healthy:');
				console.log(result.body);
				return true;
			}
		} catch (e) {
			console.log('Waiting for service to be ready ...');
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

module.exports = async function () {
	await waitUntilServiceIsReadyOr5Min();
	// await connect();
	// await waitUntilDbIsReadyOr20Sec();
	// await disconnect();
};
