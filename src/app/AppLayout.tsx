import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@shared/types/routes';
import styles from './AppLayout.module.css';

const TABS = [
  { path: ROUTES.today, label: 'اليوم', icon: '◉' },
  { path: ROUTES.training, label: 'تدريب', icon: '◎' },
  { path: ROUTES.phrases, label: 'الجمل', icon: '▤' },
  { path: ROUTES.progress, label: 'التقدم', icon: '◐' },
] as const;

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div dir="rtl" className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <nav className={styles.nav} aria-label="التنقل الرئيسي">
        <div className={styles.navInner}>
          {TABS.map((tab) => {
            const active = pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`${styles.navBtn} ${active ? styles.navBtnActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span style={{ fontSize: 'var(--fs-lg)' }}>{tab.icon}</span>
                <span>{tab.label}</span>
                {active && <span className={styles.navDot} />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
