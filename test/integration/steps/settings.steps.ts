import { After, Given } from '@cucumber/cucumber';

const envVariables = new Map();

After(() => {
	envVariables.forEach((value, variable) => {
		process.env[variable] = value;
	});
	envVariables.clear();
});

Given(
	'I set the environment variable {string} to {string}',
	(variable, value) => {
		envVariables.set(variable, process.env[variable]);
		process.env[variable] = value;
	}
);
