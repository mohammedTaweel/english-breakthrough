import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlaceholderScreen } from './PlaceholderScreen';

describe('PlaceholderScreen', () => {
  it('renders the title', () => {
    render(<PlaceholderScreen title="اليوم" feature="today" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('اليوم');
  });

  it('renders the feature name', () => {
    render(<PlaceholderScreen title="اليوم" feature="today" />);
    expect(screen.getByText('today')).toBeInTheDocument();
  });
});
