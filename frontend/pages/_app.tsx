import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../styles/globals.css';
import AppShell from '../components/AppShell';
import { ToastProvider } from '../components/ToastProvider';
import type { AuthUser } from '../utils/api/authApi';
import { getUserSession } from '../utils/localStorage';
import { canAccessPath, getDefaultRouteForUser } from '../utils/rbac';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const isAuthPage =
    router.pathname === '/login' || router.pathname === '/register';

  const isPublicPage = router.pathname === '/login';

  useEffect(() => {
    setCurrentUser(getUserSession());
    setIsSessionReady(true);
  }, [router.asPath]);

  useEffect(() => {
    if (!router.isReady || isPublicPage || !isSessionReady) {
      return;
    }

    if (!currentUser) {
      const persistedUser = getUserSession();
      if (persistedUser) {
        setCurrentUser(persistedUser);
        return;
      }

      void router.replace('/login');
      return;
    }

    if (!canAccessPath(router.pathname, currentUser)) {
      void router.replace(getDefaultRouteForUser(currentUser));
    }
  }, [currentUser, isPublicPage, isSessionReady, router, router.pathname]);

  return (
    <ToastProvider>
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : !isSessionReady ||
        !currentUser ||
        !canAccessPath(router.pathname, currentUser) ? null : (
        <AppShell user={currentUser}>
          <Component {...pageProps} />
        </AppShell>
      )}
    </ToastProvider>
  );
}
