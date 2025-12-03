import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TableFilters } from '../components/TableFilters';

describe('TableFilters', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it('renders input with correct value', () => {
    const mockSet = vi.fn();
    render(<TableFilters searchValue='test' setSearchValue={mockSet} />);
    const input = screen.getByPlaceholderText('Search users...') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('test');
  });

  it('calls setSearchValue on input change', () => {
    const mockSet = vi.fn();
    render(<TableFilters searchValue='' setSearchValue={mockSet} />);
    const input = screen.getByPlaceholderText('Search users...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(mockSet).toHaveBeenCalledWith('new value');
  });

  it('updates input value when prop changes', () => {
    const mockSet = vi.fn();
    const { rerender } = render(
      <TableFilters searchValue='' setSearchValue={mockSet} />
    );
    const input = screen.getByPlaceholderText('Search users...') as HTMLInputElement;
    expect(input.value).toBe('');

    rerender(<TableFilters searchValue='updated' setSearchValue={mockSet} />);
    const updatedInput = screen.getByPlaceholderText(
      'Search users...'
    ) as HTMLInputElement;
    expect(updatedInput.value).toBe('updated');
  });
});
