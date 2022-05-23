import path from 'path';
import fs from 'fs';
import { When } from '@cucumber/cucumber';
import expect from 'expect';

When('I execute the graphql query {string}', async (query: string) => {
	console.log('query: ', query);
});
