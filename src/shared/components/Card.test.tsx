import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello card</Card>);
    expect(screen.getByText('Hello card')).toBeInTheDocument();
  });

  it('applies the correct variant class', () => {
    const { container } = render(<Card variant="accent">Accent</Card>);
    expect(container.firstElementChild!.className).toContain('accent');
  });

  it('applies the correct padding class', () => {
    const { container } = render(<Card padding="lg">Large pad</Card>);
    expect(container.firstElementChild!.className).toContain('padLg');
  });

  it('defaults to default variant and md padding', () => {
    const { container } = render(<Card>Default</Card>);
    const el = container.firstElementChild!;
    expect(el.className).toContain('default');
    expect(el.className).toContain('padMd');
  });

  it('applies success variant class', () => {
    const { container } = render(<Card variant="success">Done</Card>);
    expect(container.firstElementChild!.className).toContain('success');
  });

  it('applies warn variant class', () => {
    const { container } = render(<Card variant="warn">Warning</Card>);
    expect(container.firstElementChild!.className).toContain('warn');
  });

  it('merges custom className', () => {
    const { container } = render(<Card className="custom">Merged</Card>);
    expect(container.firstElementChild!.className).toContain('custom');
  });

  it('applies none padding class', () => {
    const { container } = render(<Card padding="none">No pad</Card>);
    expect(container.firstElementChild!.className).toContain('padNone');
  });
});
