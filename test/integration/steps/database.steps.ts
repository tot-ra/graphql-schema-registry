import {Then} from "@cucumber/cucumber";
import expect from 'expect';

Then('the database must contain an operation named {string}', async (name: string) => {
	const {connection} = await import('../../../src/database');
	const resp = await connection('type_def_operations')
		.count('name', {as: 'totalOps'})
		.where('name', name);

	expect(resp[0]['totalOps']).toEqual(1);
})

Then('the database must contain a type {string} named {string}', async (type: string, name: string) => {
	const {connection} = await import('../../../src/database');
	const resp = await connection('type_def_types')
		.count('name', {as: 'totalTypes'})
		.where('name', name)
		.andWhere('type', type.toUpperCase());

	expect(resp[0]['totalTypes']).toEqual(1);
})
