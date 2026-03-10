import type { Application } from 'express';
import { createServer, ViteDevServer } from 'vite';

let viteServer: ViteDevServer | null = null;

export default async function setupDev(app: Application) {
	const hmrPort = Number(process.env.HMR_PORT || 24678);
	const hmrClientPort = Number(process.env.HMR_CLIENT_PORT || hmrPort);

	viteServer = await createServer({
		server: {
			middlewareMode: true,
			hmr: {
				host: '0.0.0.0',
				port: hmrPort,
				clientPort: hmrClientPort,
			},
		},
		appType: 'custom',
	});

	app.locals.vite = viteServer;
	app.use(viteServer.middlewares);
}

export async function closeDevServer() {
	if (viteServer) {
		await viteServer.close();
		viteServer = null;
	}
}
