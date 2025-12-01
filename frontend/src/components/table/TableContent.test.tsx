import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import type { GetUsersQuery } from '../../__generated__/graphql'

// Mock third-party spinner to avoid JSDOM issues
vi.mock('react-loader-spinner', () => ({
	RotatingLines: () => (<div data-testid="spinner" />),
}))

// Hoist a mock for apollo useQuery; configure per test
vi.mock('@apollo/client/react', () => ({
	useQuery: vi.fn(),
}))

describe('TableContent', () => {
	afterEach(() => {
		cleanup()
		vi.clearAllMocks()
	})

	it('shows a loading indicator initially', () => {
		vi.resetModules()
		return import('@apollo/client/react').then(async (apollo) => {
			;(apollo.useQuery as unknown as Mock).mockReturnValue({ data: undefined, loading: true, error: undefined })
			const { TableContent } = await import('./TableContent')
			render(<TableContent searchValue={''} />)
			const status = screen.getByRole('status')
			const text = screen.getByText(/loading/i)
			expect(status).toBeTruthy()
			expect(text).toBeTruthy()
		})
	})

	it('renders an error state when the query fails', async () => {
		vi.resetModules()
		const apollo = await import('@apollo/client/react')
		;(apollo.useQuery as unknown as Mock).mockReturnValue({ data: undefined, loading: false, error: new Error('Boom') })
		const { TableContent } = await import('./TableContent')
		render(<TableContent searchValue={''} />)

		const error = await screen.findByText(/error: boom/i)
		expect(error).toBeTruthy()
	})

	it('renders table headers and rows from data', async () => {
		vi.resetModules()
		const users: GetUsersQuery['users'] = [
			{
				id: 1,
				name: 'Alice',
				age: 30,
				email: 'alice@example.com',
				phone: '123-456',
				posts: [
					{ id: 10, userId: 1, title: 'Hello', content: 'World' },
					{ id: 11, userId: 1, title: 'Second', content: 'Post' },
				],
				__typename: 'User',
			},
		]

		const apollo = await import('@apollo/client/react')
		;(apollo.useQuery as unknown as Mock).mockReturnValue({ data: { users }, loading: false, error: undefined })
		const { TableContent } = await import('./TableContent')
		render(<TableContent searchValue={'1'} />)

		// Wait for data to appear
		const rowNameCell = await screen.findByText('Alice')
		expect(rowNameCell).toBeTruthy()

		// Table structure and headers
    const table = screen.getByRole('table')
    const thead = table.querySelector('thead') as HTMLElement
    const headers = within(thead).getAllByRole('columnheader').map((th) => th.textContent?.trim())
    expect(headers).toEqual(['ID', 'Name', 'Age', 'Email', 'Phone', 'Post Count'])		// Cells content
		expect(screen.getByText('1')).toBeTruthy() // ID
		expect(screen.getByText('30')).toBeTruthy() // Age
		expect(screen.getByText('alice@example.com')).toBeTruthy() // Email
		expect(screen.getByText('123-456')).toBeTruthy() // Phone

		// Post count visible
		expect(screen.getByText('2')).toBeTruthy()
	})

	it('passes the correct filters to useQuery', async () => {
		vi.resetModules()
		const apollo = await import('@apollo/client/react')
		;(apollo.useQuery as unknown as Mock).mockReturnValue({ data: { users: [] }, loading: false, error: undefined })
		const { TableContent: Comp } = await import('./TableContent')

		const searchValue = '42'
		render(<Comp searchValue={searchValue} />)

		const mockFn = apollo.useQuery as unknown as Mock
		expect(mockFn).toHaveBeenCalledTimes(1)
		const call = mockFn.mock.calls[0]
		const vars = call[1]?.variables
		expect(vars).toEqual({
			filters: {
				id: { equals: 42 },
				age: { equals: 42 },
				name: { contains: '42' },
				email: { contains: '42' },
				phone: { contains: '42' },
			},
		})
	})
})

