import glob from 'glob';
import path from 'path';

export async function listFsMocks(fileType: string, extension: string) {
	return new Promise<string[]>((resolve, reject) =>
		glob(
			path.join(
				process.cwd(),
				`@(devTools|generated|src)/**/*.${fileType}.@(${extension})`
			),
			(error, files) => {
				if (error) {
					reject(error);
				} else {
					resolve(files);
				}
			}
		)
	);
}
