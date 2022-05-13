import schemaDB from '../database/schema';
import { getAndValidateSchema } from './schema';
import { connection } from '../database';
import * as federation from '../helpers/federation';

jest.mock('../database/schema');
jest.mock('../helpers/federation');

describe('controller/schema', () => {
	it('getting schemas validates by default', async () => {
		const serviceA = {
			name: 'service-a',
			version: '1.0',
			url: 'http://service-a/graphql',
			type_defs: 'type Query { me: String! }',
		};

		const serviceB = {
			name: 'service-b',
			version: '1.0',
			url: 'http://service-b/graphql',
			type_defs: 'type Query { hello: String! }',
		};

		schemaDB.getLastUpdatedForActiveServices = jest
			.fn()
			.mockResolvedValue([serviceA, serviceB]);

		await getAndValidateSchema(connection);

		expect(federation.composeAndValidateSchema).toHaveBeenCalled();
	});

	it('getting schemas does not validate if not requested', async () => {
		const serviceA = {
			name: 'service-a',
			version: '1.0',
			url: 'http://service-a/graphql',
			type_defs: 'type Query { me: String! }',
		};

		const serviceB = {
			name: 'service-b',
			version: '1.0',
			url: 'http://service-b/graphql',
			type_defs: 'type Query { hello: String! }',
		};

		schemaDB.getLastUpdatedForActiveServices = jest
			.fn()
			.mockResolvedValue([serviceA, serviceB]);

		await getAndValidateSchema(connection, false, false);

		expect(federation.composeAndValidateSchema).not.toHaveBeenCalled();
	});
});
