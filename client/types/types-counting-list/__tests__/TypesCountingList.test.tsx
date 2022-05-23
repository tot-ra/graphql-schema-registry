import { act, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { TypesCountingList } from '../TypesCountingList';
import * as SkeletonBundle from '../TypesCountingList.Skeleton';
import { ListCount, LIST_TYPES } from '../../../utils/queries';
import { MemoryRouter } from 'react-router-dom';
import * as useMinimumTime from '../../../shared/useMinimumTime';

jest.mock('../../../components/List', () => {
	const originalModule = jest.requireActual('../../../components/List');

	return {
		...originalModule,
		NavigationListItem: () => 'NavigationListItem',
	};
});

describe('TypesCountingList tests', () => {
	it("should render an Skeleton when it's fetching", () => {
		const mock = {
			request: {
				query: LIST_TYPES,
			},
			result: {
				data: {
					listTypes: {
						operations: [],
						entities: [],
					},
				},
			},
		};

		const skeleton = jest.spyOn(
			SkeletonBundle,
			'TypesCountingListSkeleton'
		);

		render(
			<MockedProvider mocks={[mock]}>
				<TypesCountingList />
			</MockedProvider>
		);

		expect(skeleton).toHaveBeenCalled();
	});

	it("should render an error message when there's an error", async () => {
		const errorMock = {
			request: {
				query: LIST_TYPES,
			},
			error: new Error('An error occurred'),
		};

		render(
			<MockedProvider mocks={[errorMock]}>
				<TypesCountingList />
			</MockedProvider>
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const error = await screen.findByText('Something wrong happened :(');

		expect(error).toBeInTheDocument();
	});

	it("should render a message when there's no items", async () => {
		const errorMock = {
			request: {
				query: LIST_TYPES,
			},
			result: {
				data: {
					listTypes: {
						operations: [],
						entities: [],
					},
				},
			},
		};

		render(
			<MockedProvider mocks={[errorMock]}>
				<TypesCountingList />
			</MockedProvider>
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const message = await screen.findByText('No types found!');

		expect(message).toBeInTheDocument();
	});

	it('should render the items', async () => {
		const fakeUseMimimumTime = jest.spyOn(useMinimumTime, 'default');

		fakeUseMimimumTime.mockReturnValue(true);

		const mock = {
			request: {
				query: LIST_TYPES,
			},
			result: {
				data: {
					listTypes: {
						operations: [
							{
								type: 'dummy',
								count: 12,
							},
						] as ListCount[],
						entities: [
							{
								type: 'bar',
								count: 15,
							},
							{
								type: 'bar2',
								count: 15,
							},
						] as ListCount[],
					},
				},
			},
		};

		render(
			<MockedProvider mocks={[mock]}>
				<TypesCountingList />
			</MockedProvider>,
			{
				wrapper: MemoryRouter,
			}
		);

		fakeUseMimimumTime.mockReturnValue(false);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const nav = await screen.getByRole('complementary');
		expect(nav).toBeInTheDocument();

		expect(nav.children.length).toBe(2);

		expect(nav.children[0].childNodes.length).toBe(
			mock.result.data.listTypes.operations.length
		);

		expect(nav.children[1].childNodes.length).toBe(
			mock.result.data.listTypes.entities.length
		);
	});
});
