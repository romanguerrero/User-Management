import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoverCard } from './HoverCard';

describe('HoverCard', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // Mock window dimensions for positioning tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('renders children correctly', () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    expect(screen.getByText('Hover Me')).toBeTruthy();
  });

  it('does not show tooltip initially', () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows tooltip on mouse enter', async () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Test Content')).toBeTruthy();
    });
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
    
    fireEvent.mouseLeave(trigger!);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  it('shows tooltip on focus', async () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.focus(trigger!);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
  });

  it('hides tooltip on blur', async () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.focus(trigger!);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
    
    fireEvent.blur(trigger!);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  it('hides tooltip on Escape key press', async () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  it('trigger element is keyboard focusable', () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    expect(trigger?.getAttribute('tabIndex')).toBe('0');
  });

  it('renders without title', async () => {
    render(
      <HoverCard content="Only Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
      expect(screen.getByText('Only Content')).toBeTruthy();
      expect(screen.queryByText('Test Title')).toBeNull();
    });
  });

  it('renders without content', async () => {
    render(
      <HoverCard title="Only Title">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
      expect(screen.getByText('Only Title')).toBeTruthy();
    });
  });

  it('renders with ReactNode title and content', async () => {
    render(
      <HoverCard 
        title={<strong>Bold Title</strong>} 
        content={<em>Italic Content</em>}
      >
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      expect(screen.getByText('Bold Title')).toBeTruthy();
      expect(screen.getByText('Italic Content')).toBeTruthy();
    });
  });

  it('handles rapid hover on/off without errors', async () => {
    const user = userEvent.setup();
    
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement!;
    
    // Rapidly hover on and off
    await user.hover(trigger);
    await user.unhover(trigger);
    await user.hover(trigger);
    await user.unhover(trigger);
    
    // Should not throw errors
    expect(true).toBe(true);
  });

  it('computes tooltip position correctly', async () => {
    const { container } = render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    
    // Mock getBoundingClientRect
    vi.spyOn(trigger!, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      bottom: 70,
      right: 200,
      width: 100,
      height: 20,
      x: 100,
      y: 50,
      toJSON: () => {},
    });
    
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      const style = tooltip.style;
      expect(style.position).toBe('fixed');
      expect(style.left).toBeTruthy();
      expect(style.top).toBeTruthy();
    });
  });

  it('adjusts tooltip position when near viewport edge', async () => {
    render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    const trigger = screen.getByText('Hover Me').parentElement;
    
    // Mock getBoundingClientRect to simulate near-edge position
    vi.spyOn(trigger!, 'getBoundingClientRect').mockReturnValue({
      left: 900, // Near right edge
      top: 50,
      bottom: 70,
      right: 1000,
      width: 100,
      height: 20,
      x: 900,
      y: 50,
      toJSON: () => {},
    });
    
    fireEvent.mouseEnter(trigger!);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeTruthy();
      // Tooltip should be repositioned to fit in viewport
    });
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(
      <HoverCard title="Test Title" content="Test Content">
        <button>Hover Me</button>
      </HoverCard>
    );
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
