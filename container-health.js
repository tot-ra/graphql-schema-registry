/**
 * This script is meant to be used inside container to check the health of a service
 */
const http = require('http');

const options = {
	// we run check from docker container, so it should be local
	host: 'localhost',
	// client port
	port: 3000,
	// health endpoint to call
	path: '/health',
};

const req = http.request(options, (response) => {
	response.on('end', () => {
		if (response.statusCode === 200) {
			process.exit(0);
		} else {
			process.exit(1);
		}
	});
});

req.on('error', () => {
	process.exit(1);
});

req.end();
