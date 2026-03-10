import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../styles/globals.css';
import AppShell from '../components/AppShell';
import { ToastProvider } from '../components/ToastProvider';
import type { AuthUser } from '../utils/authApi';
import { getUserSession } from '../utils/localStorage';
import { canAccessPath, getDefaultRouteForUser } from '../utils/rbac';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const isPublicPage = ['/login', '/prototype-users'].includes(router.pathname);

  useEffect(() => {
    setCurrentUser(getUserSession());
    setIsSessionReady(true);
  }, [router.asPath]);

  useEffect(() => {
    if (!router.isReady || isPublicPage || !isSessionReady) {
      return;
    }

    if (!currentUser) {
      void router.replace('/login');
      return;
    }

    if (!canAccessPath(router.pathname, currentUser)) {
      void router.replace(getDefaultRouteForUser(currentUser));
    }
  }, [currentUser, isPublicPage, isSessionReady, router, router.pathname]);

  if (isPublicPage) {
    return (
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    );
  }

  if (
    !isSessionReady ||
    !currentUser ||
    !canAccessPath(router.pathname, currentUser)
  ) {
    return null;
  }

  return (
    <ToastProvider>
      <AppShell user={currentUser}>
        <Component {...pageProps} />
      </AppShell>
    </ToastProvider>
  );
}
