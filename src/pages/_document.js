import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script'; // Import next/script
import { GA_TRACKING_ID } from '../lib/gtag'; // Import GA_TRACKING_ID

export default function Document() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-YOUR_PUBLISHER_ID"; // Replace with your actual ID or use env var
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <Html lang="es">
      <Head>
        {/* Google AdSense Script */}
        {publisherId && publisherId !== "ca-pub-YOUR_PUBLISHER_ID" && ( // Only include if a real ID is provided
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive" // Good strategy for AdSense
          />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Google Analytics - GA4 */}
        {isProduction && GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        {/* Add other meta tags, link tags for fonts, etc. here if needed */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
