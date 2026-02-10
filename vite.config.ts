import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [
		react({
			include: '**/*.{jsx,tsx}',
		}),
	],
	define: {
		'process.env': '{}',
		global: 'globalThis',
	},
	root: '.',
	base: '/assets/',
	build: {
		outDir: 'dist/assets',
		emptyOutDir: true,
		lib: {
			entry: path.resolve(__dirname, 'client/entry-standalone.tsx'),
			name: 'ManagementUIStandalone',
			fileName: () => 'management-ui-standalone.js',
			formats: ['umd'],
		},
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					const info = assetInfo.name.split('.');
					const ext = info[info.length - 1];
					return `[name][extname]`;
				},
				chunkFileNames: '[name].[hash].js',
			},
		},
		sourcemap: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'client'),
		},
	},
	server: {
		port: 3000,
		open: true,
		cors: true,
		allowedHosts: true,
	},
});
