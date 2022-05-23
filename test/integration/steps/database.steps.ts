import { Then } from '@cucumber/cucumber';
import expect from 'expect';

Then(
	'the database must contain an operation named {string}',
	async (name: string) => {
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_operations')
			.count('name', { as: 'totalOps' })
			.where('name', name);

		expect(resp[0]['totalOps']).toEqual(1);
	}
);

Then(
	'the database must not contain an operation named {string}',
	async (name: string) => {
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_operations')
			.count('name', { as: 'totalOps' })
			.where('name', name);

		expect(resp[0]['totalOps']).toEqual(0);
	}
);

Then(
	'the database must contain a type {string} named {string}',
	async (type: string, name: string) => {
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_types')
			.count('name', { as: 'totalTypes' })
			.where('name', name)
			.andWhere('type', type.toUpperCase());

		expect(resp[0]['totalTypes']).toEqual(1);
	}
);

Then(
	'the database must contain some {string} types as {string}',
	async (type: string, names: string) => {
		const listOfNames: string[] = names.split(',');
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_types')
			.count('name', { as: 'totalTypes' })
			.whereIn('name', listOfNames)
			.where('type', type.toUpperCase());

		expect(resp[0]['totalTypes']).toEqual(listOfNames.length);
	}
);

Then(
	'the database must not contain some {string} types as {string}',
	async (type: string, names: string) => {
		const listOfNames: string[] = names.split(',');
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_types')
			.count('name', { as: 'totalTypes' })
			.whereIn('name', listOfNames)
			.where('type', type.toUpperCase());

		expect(resp[0]['totalTypes']).toEqual(0);
	}
);

Then(
	'the database must contain some fields as {string}',
	async (names: string) => {
		const listOfNames: string[] = names.split(',');
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_fields')
			.count('name', { as: 'totalTypes' })
			.whereIn('name', listOfNames);

		expect(resp[0]['totalTypes']).toEqual(listOfNames.length);
	}
);

Then(
	'the database must contain some query parameters as {string}',
	async (names: string) => {
		const listOfNames: string[] = names.split(',');
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_operation_parameters')
			.count('name', { as: 'totalTypes' })
			.whereIn('name', listOfNames);

		expect(resp[0]['totalTypes']).toEqual(listOfNames.length);
	}
);

Then(
	'the database must contain {int} subgraph fields for service {int}',
	async (totalFields: number, serviceId: number) => {
		const { connection } = await import('../../../src/database');
		const resp = await connection('type_def_subgraphs')
			.count('service_id', { as: 'totalTypes' })
			.where('service_id', serviceId);

		expect(resp[0]['totalTypes']).toEqual(totalFields);
	}
);
