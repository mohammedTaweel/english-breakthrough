import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies the correct variant class', () => {
    const { container } = render(<Badge variant="success">Done</Badge>);
    expect(container.firstElementChild!.className).toContain('success');
  });

  it('applies error variant class', () => {
    const { container } = render(<Badge variant="error">Fail</Badge>);
    expect(container.firstElementChild!.className).toContain('error');
  });

  it('applies warn variant class', () => {
    const { container } = render(<Badge variant="warn">Alert</Badge>);
    expect(container.firstElementChild!.className).toContain('warn');
  });

  it('applies accent variant class', () => {
    const { container } = render(<Badge variant="accent">Info</Badge>);
    expect(container.firstElementChild!.className).toContain('accent');
  });

  it('defaults to default variant and sm size', () => {
    const { container } = render(<Badge>Default</Badge>);
    const el = container.firstElementChild!;
    expect(el.className).toContain('default');
    expect(el.className).toContain('sm');
  });

  it('applies md size class', () => {
    const { container } = render(<Badge size="md">Medium</Badge>);
    expect(container.firstElementChild!.className).toContain('md');
  });
});
