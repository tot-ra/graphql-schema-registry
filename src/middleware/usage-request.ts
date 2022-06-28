import zlib from 'zlib';
import { logger } from '../logger';

export default async (req, res, next) => {
	logger.info('MIDDLEWARE CALL');

	const data = [];
	let buffer;
	req.addListener('data', (chunk) => {
		data.push(Buffer.from(chunk));
	});
	req.addListener('end', () => {
		buffer = Buffer.concat(data);
		zlib.gunzip(buffer, (err, result) => {
			if (!err) {
				req.body = result;
				next();
			} else {
				next(err);
			}
		});
	});
};
