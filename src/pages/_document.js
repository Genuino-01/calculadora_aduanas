import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-YOUR_PUBLISHER_ID"; // Replace with your actual ID or use env var

  return (
    <Html lang="es">
      <Head>
        {/* Google AdSense Script */}
        {publisherId && publisherId !== "ca-pub-YOUR_PUBLISHER_ID" && ( // Only include if a real ID is provided
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
          ></script>
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
