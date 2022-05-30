import * as fs from 'fs';

const getSeedFile = (): Buffer => {
	const dir = 'test/integration/config/init.sql';
	return fs.readFileSync(dir);
};

export { getSeedFile };
