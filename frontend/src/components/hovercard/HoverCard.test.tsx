import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { HoverCard } from './HoverCard';

// Test constants
const MOCK_VIEWPORT = { width: 1024, height: 768 };
const MOCK_TRIGGER_BOUNDS = {
  left: 100,
  top: 50,
  bottom: 70,
  right: 200,
  width: 100,
  height: 20,
};

// Test helpers
const renderHoverCard = (props: {
  title?: React.ReactNode;
  content?: React.ReactNode;
}) => {
  return render(
    <HoverCard {...props}>
      <button>Hover Me</button>
    </HoverCard>
  );
};

const getTriggerElement = () => screen.getByText('Hover Me').parentElement!;

const showTooltipWithMouse = async () => {
  const trigger = getTriggerElement();
  fireEvent.mouseEnter(trigger);
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeTruthy());
  return trigger;
};

const mockTriggerBounds = (overrides: Partial<DOMRect> = {}) => {
  const defaults: DOMRect = {
    ...MOCK_TRIGGER_BOUNDS,
    x: MOCK_TRIGGER_BOUNDS.left,
    y: MOCK_TRIGGER_BOUNDS.top,
    toJSON: () => {},
  };
  return { ...defaults, ...overrides } as DOMRect;
};

describe('HoverCard', () => {
  let boundingRectSpy: ReturnType<typeof vi.spyOn> | null = null;

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    if (boundingRectSpy) {
      boundingRectSpy.mockRestore();
      boundingRectSpy = null;
    }
  });

  beforeEach(() => {
    // Mock window dimensions for positioning tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOCK_VIEWPORT.width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: MOCK_VIEWPORT.height,
    });
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      expect(screen.getByText('Hover Me')).toBeTruthy();
    });

    it('does not show tooltip initially', () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('renders with ReactNode title and content', async () => {
      renderHoverCard({
        title: <strong>Bold Title</strong>,
        content: <em>Italic Content</em>,
      });
      
      await showTooltipWithMouse();
      
      expect(screen.getByText('Bold Title')).toBeTruthy();
      expect(screen.getByText('Italic Content')).toBeTruthy();
    });

    it('renders without title', async () => {
      renderHoverCard({ content: 'Only Content' });
      
      await showTooltipWithMouse();
      
      expect(screen.getByRole('tooltip')).toBeTruthy();
      expect(screen.getByText('Only Content')).toBeTruthy();
      expect(screen.queryByText('Test Title')).toBeNull();
    });

    it('renders without content', async () => {
      renderHoverCard({ title: 'Only Title' });
      
      await showTooltipWithMouse();
      
      expect(screen.getByRole('tooltip')).toBeTruthy();
      expect(screen.getByText('Only Title')).toBeTruthy();
    });
  });

  describe('Tooltip Visibility', () => {
    it('shows tooltip on mouse enter with title and content', async () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      await showTooltipWithMouse();
      
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('hides tooltip on mouse leave', async () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      const trigger = await showTooltipWithMouse();
      
      fireEvent.mouseLeave(trigger);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).toBeNull();
      });
    });
  });

  describe('Keyboard Interactions', () => {
    it('shows tooltip on focus', async () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      const button = screen.getByText('Hover Me');
      fireEvent.focus(button);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeTruthy();
      });
    });

    it('hides tooltip on blur', async () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      const button = screen.getByText('Hover Me');
      fireEvent.focus(button);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeTruthy();
      });
      
      fireEvent.blur(button);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).toBeNull();
      });
    });

    it('hides tooltip on Escape key press', async () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      await showTooltipWithMouse();
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).toBeNull();
      });
    });
  });

  describe('Positioning', () => {
    it('positions tooltip below trigger with configured gap', async () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      const trigger = getTriggerElement();
      
      boundingRectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(mockTriggerBounds());
      
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const style = tooltip.style;
        expect(style.position).toBe('fixed');
        expect(style.left).toBe('100px'); 
        expect(style.top).toBe('78px'); // bottom (70) + gap (8)
      });
    });

    it('adjusts tooltip position when near right viewport edge', async () => {
      renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      const trigger = getTriggerElement();
      
      // Mock trigger near right edge - tooltip would overflow
      boundingRectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(
        mockTriggerBounds({
          left: 900,
          right: 1000,
          x: 900,
        })
      );
      
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const style = tooltip.style;
        // Tooltip (280px wide) repositioned to fit in viewport (1024px)
        // maxLeft = 1024 - 280 - 8 = 736px
        expect(style.left).toBe('736px');
        expect(style.top).toBe('78px');
      });
    });
  });

  describe('Cleanup', () => {
    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHoverCard({ title: 'Test Title', content: 'Test Content' });
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
