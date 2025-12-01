import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { TableFilters } from './TableFilters'

describe('TableFilters', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })
  it('renders input with correct value', () => {
    const mockSet = vi.fn()
    render(<TableFilters searchValue="test" setSearchValue={mockSet} />)
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('test')
  })

  it('calls setSearchValue on input change', () => {
    const mockSet = vi.fn()
    render(<TableFilters searchValue="" setSearchValue={mockSet} />)
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(mockSet).toHaveBeenCalledWith('new value')
  })
})
