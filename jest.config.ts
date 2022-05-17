import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	projects: [
		'<rootDir>/client/jest.config.ts',
		'<rootDir>/test/unit/jest.config.cjs',
	],
};
export default config;
