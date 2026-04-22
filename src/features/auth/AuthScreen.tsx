import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { signUp, signIn, signInWithGoogle } from '@lib/firebase';
import { useAuth } from './useAuth';
import { Button } from '@shared/components';
import { Input } from '@shared/components';
import { ROUTES } from '@shared/types/routes';
import styles from './AuthScreen.module.css';

type Mode = 'login' | 'register';

const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/email-already-in-use': 'البريد مستخدم — سجّل دخول بدل إنشاء حساب',
  'auth/invalid-email': 'صيغة البريد غير صحيحة',
  'auth/weak-password': 'كلمة المرور ضعيفة — استخدم 6 أحرف على الأقل',
  'auth/user-not-found': 'الحساب غير موجود',
  'auth/wrong-password': 'كلمة المرور غير صحيحة',
  'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
  'auth/too-many-requests': 'محاولات كثيرة — انتظر دقيقة وحاول مرة ثانية',
  'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
  'auth/network-request-failed': 'مشكلة في الاتصال — تحقق من الإنترنت',
};

function friendlyError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    return FIREBASE_ERROR_MAP[code] ?? 'حدث خطأ غير متوقع. حاول مرة ثانية.';
  }
  return 'حدث خطأ غير متوقع. حاول مرة ثانية.';
}

export function AuthScreen() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={ROUTES.today} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        await signUp(email.trim(), password, displayName.trim() || email.trim());
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir="rtl" className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {mode === 'register' ? 'حساب جديد' : 'تسجيل الدخول'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'register'
              ? 'سجّل وابدأ رحلتك في اكتساب الإنجليزية'
              : 'أدخل بياناتك لمتابعة التدريب'}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <Input
              label="الاسم"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="اسمك (يظهر في ملفك الشخصي)"
              autoComplete="name"
            />
          )}

          <Input
            label="البريد الإلكتروني"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            required
          />

          <Input
            label="كلمة المرور"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 أحرف على الأقل"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />

          {error && (
            <div className={styles.errorBox} role="alert">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? '...' : mode === 'register' ? 'إنشاء حساب' : 'دخول'}
          </Button>
        </form>

        <div className={styles.divider}>أو</div>

        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={submitting}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          الدخول بحساب Google
        </button>

        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? (
            <>
              ما عندك حساب؟ <b>سجّل الآن</b>
            </>
          ) : (
            <>
              عندك حساب؟ <b>سجّل دخول</b>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
