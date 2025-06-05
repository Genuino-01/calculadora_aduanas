import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as gtag from '../lib/gtag'; // Import GA utility
import '../styles/globals.css'; // Import global styles

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Optional: disable refetch on window focus
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (isProduction && gtag.GA_TRACKING_ID) {
        gtag.pageview(url);
      }
    };
    //Subscribe to router changes
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('hashChangeComplete', handleRouteChange);

    //Unsubscribe from events when component unmounts
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('hashChangeComplete', handleRouteChange);
    };
  }, [router.events, isProduction]);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
