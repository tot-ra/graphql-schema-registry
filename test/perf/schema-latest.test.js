/* eslint-disable */
import http from 'k6/http';
import { check, sleep } from 'k6';

const domain = __ENV.TARGET_URL ? __ENV.TARGET_URL : 'gql-schema-registry:3000';

export const options = {
	thresholds: {
		http_req_failed: ['rate<0.01'], // http errors should be less than 1%
		http_req_duration: ['med < 1500', 'p(90) < 2200', 'p(99.9) < 3000'],
	},
	stages: [
		{ duration: '5s', target: 200 },
		{ duration: '10s', target: 400 },
		{ duration: '20s', target: 600 },
		{ duration: '10s', target: 400 },
	],
};

export function setup() {
	console.log(http.post(`http://${domain}/schema/push`, JSON.stringify({
			name: 'service_a', // service name
			version: 'v2', //service version, like docker container hash. Use 'latest' for dev env
			type_defs: 'type Query {\n		hi: String\n	}',
			url: 'http://localhost:6101',
		}), {
			headers: {
				'Content-Type': 'application/json'
			}
		},
	));
	console.log(http.post(`http://${domain}/schema/push`, JSON.stringify({
			name: 'service_b', // service name
			version: 'v2', //service version, like docker container hash. Use 'latest' for dev env
			type_defs: 'type Query {\n		world: String\n	}',
			url: 'http://localhost:6101',
		}), {
			headers: {
				'Content-Type': 'application/json'
			}
		},
	));

}

export default function () {
	const url = `http://${domain}/schema/latest`;

	const params = {
		headers: {
			'Content-Type': 'application/json',
		},
	};

	const res = http.get(url, params);
	check(res, {
		'status was 200': (r) => r.status === 200,
		'body is not empty': (r) => res.body && res.body.length > 0,
	});
	sleep(1);
};
