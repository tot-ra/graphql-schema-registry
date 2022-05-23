import path from 'path';
import fs from 'fs';
import { Given, Then } from '@cucumber/cucumber';
import expect from 'expect';

async function deleteAllBreakdownTables() {
	const breakdownSchemaTables = [
		'services',
		'type_def_field_arguments',
		'type_def_fields',
		'type_def_implementations',
		'type_def_operation_parameters',
		'type_def_operations',
		'type_def_subgraphs',
		'type_def_types',
	];
	const { connection } = await import('../../../src/database');
	await Promise.all(
		breakdownSchemaTables.map((table) => connection(table).del())
	);
}

Given(
	'the database is imported from {string}',
	async (dbStateFileName: string) => {
		await deleteAllBreakdownTables();
		const schemaFilePath = path.join(
			__dirname,
			`../data/sql/${dbStateFileName}.sql`
		);
		const { connection } = await import('../../../src/database');
		await connection.raw(fs.readFileSync(schemaFilePath, 'utf8'));
	}
);

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
