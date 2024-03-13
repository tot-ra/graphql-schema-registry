import { logger } from '../logger';

export function asyncWrap(fn) {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

export function cache(key) {
	return (req, res, next) => {
		const locals = req.app.locals;
		if (!locals.cache) {
			locals.cache = {};
		}

		const cached = locals.cache[key];
		if (cached) {
			logger.info(`Sending cached: ${key}`);
			res.set(cached.headers);
			return res.send(cached.body);
		} else {
			res.__send = res.send;
			res.send = (body) => {
				locals.cache[key] = {
					body,
					headers: res.getHeaders(),
				};
				res.__send(body);
				logger.info(`Cached: ${key}`);
			};
		}
		next();
	};
}

export function invalidate(key) {
	return (req, res, next) => {
		const locals = req.app.locals;
		if (!locals.cache) {
			return next();
		}

		res.__end = res.end;
		res.end = (data, encoding, callback) => {
			logger.info(`Invalidating: ${key}`);
			delete locals.cache[key];

			res.__end(data, encoding, callback);
		};

		return next();
	};
}
