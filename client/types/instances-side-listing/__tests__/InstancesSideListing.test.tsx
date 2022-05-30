import { MockedProvider } from '@apollo/client/testing';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import {
	ListCount,
	LIST_TYPES,
	TYPE_SIDE_INSTANCES,
} from '../../../utils/queries';
import { InstancesSideListing } from '../InstancesSideListing';
import * as SkeletonBundle from '../InstancesSideListing.Skeleton';

jest.mock('react-router-dom', () => {
	const actual = jest.requireActual('react-router-dom');
	return {
		...actual,
		useParams: jest.fn(),
	};
});

jest.mock('../../../shared/useMinimumTime', () => ({
	__esModule: true,
	default: jest.fn().mockImplementation((loading) => loading),
}));

jest.mock('../InstancesSideListing.Header', () => ({
	InstancesSideListingHeader: () => 'InstancesSideListingHeader',
}));

jest.mock('../InstancesSideListing.Body', () => ({
	InstancesSideListingBody: () => 'InstancesSideListingBody',
}));

describe('InstancesSideListing tests', () => {
	it("should render an Skeleton when it's fetching the first query", () => {
		const skeleton = jest.spyOn(
			SkeletonBundle,
			'InstancesSideListingSkeleton'
		);

		(useParams as jest.MockedFn<typeof useParams>).mockReturnValue({
			typeName: 'dummy',
			instanceId: '12',
		});

		render(
			<MockedProvider>
				<InstancesSideListing />
			</MockedProvider>,
			{
				wrapper: MemoryRouter,
			}
		);

		expect(skeleton).toHaveBeenCalled();
	});

	it("should render an error message when there's an error in the first query", async () => {
		const mocks = [
			{
				request: {
					query: LIST_TYPES,
				},
				error: new Error('dummy error'),
			},
			{
				request: {
					query: TYPE_SIDE_INSTANCES,
				},
				result: {
					data: {
						listTypeInstances: {
							operations: [],
							entities: [],
						},
					},
				},
			},
		];

		(useParams as jest.MockedFn<typeof useParams>).mockReturnValue({
			typeName: 'dummy',
			instanceId: '12',
		});

		render(
			<MockedProvider mocks={mocks}>
				<InstancesSideListing />
			</MockedProvider>,
			{
				wrapper: MemoryRouter,
			}
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const error = await screen.findByText('Something wrong happened :(');

		expect(error).toBeInTheDocument();
	});

	it("should render an Skeleton when it's fetching the second query", async () => {
		const mocks = [
			{
				request: {
					query: LIST_TYPES,
				},
				result: {
					data: {
						listTypes: {
							operations: [
								{
									count: 12,
									type: 'dummy',
								},
							] as ListCount[],
							entities: [],
						},
					},
				},
			},
			{
				request: {
					query: TYPE_SIDE_INSTANCES,
				},
				result: {
					data: {
						listTypeInstances: {
							operations: [],
							entities: [],
						},
					},
				},
			},
		];

		const skeleton = jest.spyOn(
			SkeletonBundle,
			'InstancesSideListingSkeleton'
		);

		(useParams as jest.MockedFn<typeof useParams>).mockReturnValue({
			typeName: 'dummy',
			instanceId: '12',
		});

		render(
			<MockedProvider mocks={mocks}>
				<InstancesSideListing />
			</MockedProvider>,
			{
				wrapper: MemoryRouter,
			}
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(skeleton).toHaveBeenCalled();
	});

	it("should render an error message when there's an error in the second query", async () => {
		(useParams as jest.MockedFn<typeof useParams>).mockReturnValue({
			typeName: 'dummy',
			instanceId: '12',
		});

		const mocks = [
			{
				request: {
					query: LIST_TYPES,
				},
				result: {
					data: {
						listTypes: {
							operations: [
								{
									count: 12,
									type: 'dummy',
								},
							] as ListCount[],
							entities: [],
						},
					},
				},
			},
			{
				request: {
					query: TYPE_SIDE_INSTANCES,
					variables: { type: 'dummy', limit: 12 },
				},
				error: new Error('dummy error'),
			},
		];

		render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<InstancesSideListing />
			</MockedProvider>
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const error = await screen.findByText('Something wrong happened :(');

		expect(error).toBeInTheDocument();
	});

	it("should render when everything's ok", async () => {
		(useParams as jest.MockedFn<typeof useParams>).mockReturnValue({
			typeName: 'dummy',
			instanceId: '12',
		});

		const mocks = [
			{
				request: {
					query: LIST_TYPES,
				},
				result: {
					data: {
						listTypes: {
							operations: [
								{
									count: 12,
									type: 'dummy',
								},
							] as ListCount[],
							entities: [],
						},
					},
				},
			},
			{
				request: {
					query: TYPE_SIDE_INSTANCES,
					variables: { type: 'dummy', limit: 12 },
				},
				result: {
					data: {
						listTypeInstances: {
							items: [],
						},
					},
				},
			},
		];

		render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<InstancesSideListing />
			</MockedProvider>
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const container = await screen.findByRole('complementary');

		expect(container).toBeInTheDocument();
	});
});
