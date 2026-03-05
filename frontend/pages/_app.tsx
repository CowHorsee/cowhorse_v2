import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage =
    router.pathname === '/login' || router.pathname === '/register';

  return isAuthPage ? (
    <Component {...pageProps} />
  ) : (
    <AppShell>
      <Component {...pageProps} />
    </AppShell>
  );
}
