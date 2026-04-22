import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders a label', () => {
    render(<Input label="الاسم" />);
    expect(screen.getByLabelText('الاسم')).toBeInTheDocument();
  });

  it('links label to input via htmlFor', () => {
    render(<Input label="البريد" />);
    const input = screen.getByLabelText('البريد');
    expect(input.tagName).toBe('INPUT');
  });

  it('shows an error message', () => {
    render(<Input label="الاسم" error="مطلوب" />);
    expect(screen.getByRole('alert')).toHaveTextContent('مطلوب');
  });

  it('marks input as invalid when error is present', () => {
    render(<Input label="الاسم" error="مطلوب" />);
    const input = screen.getByLabelText('الاسم');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a hint when no error', () => {
    render(<Input label="الاسم" hint="اكتب اسمك" />);
    expect(screen.getByText('اكتب اسمك')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input label="الاسم" hint="اكتب اسمك" error="مطلوب" />);
    expect(screen.queryByText('اكتب اسمك')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('مطلوب');
  });

  it('sets dir attribute on the input', () => {
    render(<Input label="Email" dir="ltr" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('dir', 'ltr');
  });

  it('defaults to rtl direction', () => {
    render(<Input label="الاسم" />);
    const input = screen.getByLabelText('الاسم');
    expect(input).toHaveAttribute('dir', 'rtl');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input label="الاسم" />);
    const input = screen.getByLabelText('الاسم');

    await user.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
  });

  it('passes native input attributes through', () => {
    render(<Input label="الاسم" placeholder="اكتب هنا" disabled />);
    const input = screen.getByLabelText('الاسم');
    expect(input).toHaveAttribute('placeholder', 'اكتب هنا');
    expect(input).toBeDisabled();
  });
});
