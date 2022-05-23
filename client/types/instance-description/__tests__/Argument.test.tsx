import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as DeprecatedLabelBundle from '../../../components/DeprecatedLabel';
import { Argument } from '../Argument';

const typeName = 'Dummy';

type Case = [
	{
		isArray: boolean;
		isArrayNullable: boolean;
		isNullable: boolean;
	},
	string
];

const cases: Case[] = [
	[
		{
			isArray: false,
			isArrayNullable: false,
			isNullable: false,
		},
		typeName,
	],
	[
		{
			isArray: false,
			isArrayNullable: false,
			isNullable: true,
		},
		`${typeName}!`,
	],
	[
		{
			isArray: false,
			isArrayNullable: true,
			isNullable: false,
		},
		`[${typeName}!]`,
	],
	[
		{
			isArray: false,
			isArrayNullable: true,
			isNullable: true,
		},
		`[${typeName}!]!`,
	],
	[
		{
			isArray: true,
			isArrayNullable: false,
			isNullable: false,
		},
		`[${typeName}]`,
	],
	[
		{
			isArray: true,
			isArrayNullable: false,
			isNullable: true,
		},
		`[${typeName}]!`,
	],
	[
		{
			isArray: true,
			isArrayNullable: true,
			isNullable: false,
		},
		`[${typeName}!]`,
	],
	[
		{
			isArray: true,
			isArrayNullable: true,
			isNullable: true,
		},
		`[${typeName}!]!`,
	],
];

describe('Argument tests', () => {
	test.each(cases)('should handle the case when %p', (args, expected) => {
		const { container } = render(
			<Argument
				{...args}
				type={{
					id: 12,
					kind: 'dummy',
					name: typeName,
				}}
			/>,
			{
				wrapper: MemoryRouter,
			}
		);

		const text = container.textContent;

		expect(text).toBe(expected);
	});

	describe('when name is provided', () => {
		it('should render it', () => {
			const { container } = render(
				<Argument
					name="test-name"
					isArray
					isArrayNullable
					isNullable
					type={{
						id: 12,
						kind: 'dummy',
						name: 'Dummy',
					}}
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			const text = container.textContent;

			expect(text).toBe('test-name:[Dummy!]!');
		});
	});

	describe('when name is not provided', () => {
		it('should not render it', () => {
			const { container } = render(
				<Argument
					isArray
					isArrayNullable
					isNullable
					type={{
						id: 12,
						kind: 'dummy',
						name: 'Dummy',
					}}
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			const text = container.textContent;

			expect(text).toBe('[Dummy!]!');
		});
	});

	describe('when is deprecated', () => {
		it('should render a deprecated label', () => {
			const mockDeprecatedLabel = jest.spyOn(
				DeprecatedLabelBundle,
				'DeprecatedLabel'
			);

			render(
				<Argument
					isDeprecated
					isArray
					isArrayNullable
					isNullable
					type={{
						id: 12,
						kind: 'dummy',
						name: 'Dummy',
					}}
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			expect(mockDeprecatedLabel).toHaveBeenCalledTimes(1);
		});
	});
});
