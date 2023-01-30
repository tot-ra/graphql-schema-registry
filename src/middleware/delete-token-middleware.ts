import type { NextFunction, Request, Response } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
	const { DELETE_TOKEN, SECURE_DELETE } = process.env;

	if (SECURE_DELETE === 'true') {
		const authHeader = req.header('auth');

		if (authHeader !== DELETE_TOKEN) {
			res.sendStatus(401);
			return;
		}
	}
	next();
};
