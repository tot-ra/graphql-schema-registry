import type { Application } from 'express';
import { createServer, ViteDevServer } from 'vite';

let viteServer: ViteDevServer | null = null;

export default async function setupDev(app: Application) {
	viteServer = await createServer({
		server: { middlewareMode: true },
		appType: 'custom',
	});

	app.use(viteServer.middlewares);
}

export async function closeDevServer() {
	if (viteServer) {
		await viteServer.close();
		viteServer = null;
	}
}
