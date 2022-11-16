import { resolve } from 'path';
import fs from 'fs';
import { Given, Then } from '@cucumber/cucumber';
import expect from 'expect';
import { sqlDataPath } from '../config/config';
import Knex from 'knex';
import { setDefaultTimeout } from '@cucumber/cucumber';

let dbConnection;

setDefaultTimeout(20 * 1000);

async function getConnection() {
	if (!dbConnection) {
		const { connection } = await import('../../../src/database');
		dbConnection = connection;
	}
	return dbConnection;
}

async function deleteAllBreakdownTables() {
	const breakdownSchemaTables = [
		'type_def_types',
		'type_def_operations',
		'services',
		'type_def_subgraphs',
		'type_def_implementations',
		'type_def_field_arguments',
		'type_def_operation_parameters',
		'type_def_fields',
	];

	const connection = await getConnection();
	breakdownSchemaTables.reduce(async (p, table) => {
		try {
			p.then(await connection(table).delete());
		} catch (e) {
			// ignore non-handled rejection logs
		}
	}, Promise.resolve());
}

Given(
	'the database is imported from {string}',
	async (dbStateFileName: string) => {
		await deleteAllBreakdownTables();
		const schemaFilePath = resolve(sqlDataPath, `${dbStateFileName}.sql`);
		const connection = await getConnection();
		await connection.raw(fs.readFileSync(schemaFilePath, 'utf8'));
	}
);

Then(
	'the database must contain an operation named {string}',
	async (name: string) => {
		const connection = await getConnection();
		const resp = await connection('type_def_operations')
			.count('name', { as: 'totalOps' })
			.where('name', name);

		expect(resp[0]['totalOps']).toEqual(1);
	}
);

Then(
	'the database must not contain an operation named {string}',
	async (name: string) => {
		const connection = await getConnection();
		const resp = await connection('type_def_operations')
			.count('name', { as: 'totalOps' })
			.where('name', name);

		expect(resp[0]['totalOps']).toEqual(0);
	}
);

Then(
	'the database must contain a type {string} named {string}',
	async (type: string, name: string) => {
		const connection = await getConnection();
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
		const connection = await getConnection();
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
		const connection = await getConnection();
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
		const connection = await getConnection();
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
		const connection = await getConnection();
		const resp = await connection('type_def_operation_parameters')
			.count('name', { as: 'totalTypes' })
			.whereIn('name', listOfNames);

		expect(resp[0]['totalTypes']).toEqual(listOfNames.length);
	}
);

Then(
	'the database must contain {int} subgraph fields for service {int}',
	async (totalFields: number, serviceId: number) => {
		const connection = await getConnection();
		const resp = await connection('type_def_subgraphs')
			.count('service_id', { as: 'totalTypes' })
			.where('service_id', serviceId);

		expect(resp[0]['totalTypes']).toEqual(totalFields);
	}
);

Then(
	'the database must contain a client with name {string} and version {string}',
	async (clientName: string, clientVersion: string) => {
		const connection = await getConnection();
		const resp = await connection('clients')
			.count('name', { as: 'clients' })
			.where('name', clientName)
			.andWhere('version', clientVersion);

		expect(resp[0]['clients']).toEqual(1);
	}
);
