import zlib from 'zlib';
export default async (req, res, next) => {
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
