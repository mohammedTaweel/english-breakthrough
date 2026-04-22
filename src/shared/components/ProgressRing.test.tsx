import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('renders with progressbar role', () => {
    render(<ProgressRing percent={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays the correct percentage text by default', () => {
    render(<ProgressRing percent={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('rounds the displayed percentage', () => {
    render(<ProgressRing percent={33.7} />);
    expect(screen.getByText('34%')).toBeInTheDocument();
  });

  it('clamps percent to 0 minimum', () => {
    render(<ProgressRing percent={-20} />);
    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('clamps percent to 100 maximum', () => {
    render(<ProgressRing percent={150} />);
    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('sets aria-valuenow correctly', () => {
    render(<ProgressRing percent={42} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '42',
    );
  });

  it('renders children instead of percentage when provided', () => {
    render(<ProgressRing percent={60}>Done</ProgressRing>);
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.queryByText('60%')).not.toBeInTheDocument();
  });

  it('respects custom size', () => {
    render(<ProgressRing percent={50} size={100} />);
    const svg = screen.getByRole('progressbar');
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '100');
  });
});
