import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock Firebase auth functions
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock('@lib/firebase', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signUp: (...args: unknown[]) => mockSignUp(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
  onAuthChange: vi.fn((cb: (user: null) => void) => {
    cb(null);
    return () => {};
  }),
}));

vi.mock('./auth-context-value', async (importOriginal) => {
  const original = await importOriginal<typeof import('./auth-context-value')>();
  return {
    ...original,
  };
});

vi.mock('./useAuth', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

import { AuthScreen } from './AuthScreen';

function renderAuth() {
  return render(
    <MemoryRouter>
      <AuthScreen />
    </MemoryRouter>,
  );
}

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ uid: '1', email: 'test@test.com', displayName: 'Test', photoURL: null, provider: 'password' });
    mockSignUp.mockResolvedValue({ uid: '2', email: 'new@test.com', displayName: 'New', photoURL: null, provider: 'password' });
    mockSignInWithGoogle.mockResolvedValue({ uid: '3', email: 'g@test.com', displayName: 'G', photoURL: null, provider: 'google.com' });
  });

  it('renders login mode by default', () => {
    renderAuth();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('تسجيل الدخول');
  });

  it('shows email and password fields', () => {
    renderAuth();
    expect(screen.getByLabelText('البريد الإلكتروني')).toBeInTheDocument();
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument();
  });

  it('toggles to register mode', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText('سجّل الآن'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('حساب جديد');
    expect(screen.getByLabelText('الاسم')).toBeInTheDocument();
  });

  it('toggles back to login mode', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText('سجّل الآن'));
    await user.click(screen.getByText('سجّل دخول'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('تسجيل الدخول');
  });

  it('has Google sign-in button', () => {
    renderAuth();
    expect(screen.getByText('الدخول بحساب Google')).toBeInTheDocument();
  });

  it('calls signIn on form submit', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByLabelText('البريد الإلكتروني'), 'test@test.com');
    await user.type(screen.getByLabelText('كلمة المرور'), 'password123');
    await user.click(screen.getByRole('button', { name: 'دخول' }));
    expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123');
  });

  it('calls signUp in register mode', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText('سجّل الآن'));
    await user.type(screen.getByLabelText('الاسم'), 'أحمد');
    await user.type(screen.getByLabelText('البريد الإلكتروني'), 'ahmed@test.com');
    await user.type(screen.getByLabelText('كلمة المرور'), 'password123');
    await user.click(screen.getByRole('button', { name: 'إنشاء حساب' }));
    expect(mockSignUp).toHaveBeenCalledWith('ahmed@test.com', 'password123', 'أحمد');
  });

  it('shows error on failed signIn', async () => {
    mockSignIn.mockRejectedValue({ code: 'auth/invalid-credential' });
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByLabelText('البريد الإلكتروني'), 'test@test.com');
    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'دخول' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('البريد أو كلمة المرور غير صحيحة');
  });

  it('email and password fields use ltr direction', () => {
    renderAuth();
    expect(screen.getByLabelText('البريد الإلكتروني')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByLabelText('كلمة المرور')).toHaveAttribute('dir', 'ltr');
  });
});
