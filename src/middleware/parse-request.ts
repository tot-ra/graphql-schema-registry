module.exports = async (req, res, next) => {
	const protocol = req.protocol;

	Object.defineProperty(req, 'protocol', {
		get: () => req.get('x-forwarded-proto') || protocol || 'http',
	});
	Object.defineProperty(req, 'host', {
		get: () => req.get('host'),
	});

	if (!res.locals) {
		res.locals = {};
	}
	res.locals.isLiveCompanyRegion = true;

	return next();
};
