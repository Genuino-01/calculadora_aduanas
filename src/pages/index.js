import Head from 'next/head';
import { useEffect, useState } from 'react';
import { getExchangeRate, getCurrentRateInfo } from '../lib/currencyAPI';
import Calculator from '../components/Calculator';
import AdSenseComponent from '../components/AdSenseComponent';
import Link from 'next/link'; // Import Link

export default function HomePage() {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [lastRateUpdate, setLastRateUpdate] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getExchangeRate();
      setExchangeRate(rate);
      const rateInfo = getCurrentRateInfo();
      if (rateInfo.lastFetched) {
        setLastRateUpdate(rateInfo.lastFetched.toLocaleTimeString());
      }
    };
    fetchRate();

    // Optional: Set an interval to refresh the rate display periodically if needed,
    // though currencyAPI already caches for an hour.
    // const intervalId = setInterval(fetchRate, 60 * 60 * 1000); // Every hour
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Head>
        <title>Calculadora Impuestos de Vehículos - RD</title>
        <meta name="description" content="Calculadora de impuestos de importación de vehículos en República Dominicana." />
        <link rel="icon" href="/favicon.ico" /> {/* Placeholder, add favicon later */}
      </Head>

      {/* Header Principal */}
      <header className="bg-gradient-to-r from-dga-verde to-dga-verde-oscuro text-white p-6 shadow-md">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span role="img" aria-label="car icon" className="text-2xl sm:text-3xl lg:text-4xl">🚗</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dga-verde-suave">Calculadora Impuestos de Vehículos</h1>
            <span role="img" aria-label="calculator icon" className="text-2xl sm:text-3xl lg:text-4xl">🧮</span>
          </div>
          <p className="text-base sm:text-lg text-dga-verde-menta mb-4">República Dominicana - Cálculo de aranceles e impuestos</p>
          {/* Exchange Rate Display - Modified for responsiveness */}
          {exchangeRate && (
            <div className="mt-2 text-center sm:absolute sm:top-4 sm:right-4 sm:mt-0 sm:text-left">
              <div className="inline-block bg-dga-blanco text-dga-verde-profundo text-xs sm:text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                1 USD = {parseFloat(exchangeRate).toFixed(2)} DOP
                {lastRateUpdate && <span className="block text-xxs sm:text-xs text-dga-gris-neutro">Actualizado: {lastRateUpdate}</span>}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        {/* AdSense - Top */}
        <AdSenseComponent adSlot="YOUR_AD_SLOT_ID_TOP" />
        
        {/* Calculator Component will go here */}
        <div id="calculator-placeholder" className="my-8 bg-dga-blanco rounded-xl shadow-xl"> {/* Removed padding from here, Calculator has it */}
          {/* <h2 className="text-2xl font-semibold text-dga-verde-profundo mb-4 text-center">Formulario de Cálculo</h2>
          <p className="text-center text-dga-gris-neutro">El componente de la calculadora se implementará aquí.</p> */}
          <Calculator />
        </div>

        {/* AdSense - Bottom */}
        <AdSenseComponent adSlot="YOUR_AD_SLOT_ID_BOTTOM" />

        {/* Disclaimer Summary Section */}
        <section className="mt-12 p-6 bg-dga-blanco rounded-xl shadow-lg border border-dga-verde-suave">
          <h3 className="text-xl font-semibold text-dga-verde-profundo mb-3 text-center">Información Importante</h3>
          <p className="text-sm text-dga-gris-neutro mb-2">
            Los cálculos proporcionados por esta herramienta son estimaciones aproximadas y deben ser utilizados únicamente como referencia. 
            Esta calculadora no tiene afiliación oficial con la Dirección General de Aduanas (DGA) de la República Dominicana.
          </p>
          <p className="text-sm text-dga-gris-neutro mb-4">
            Es crucial verificar todos los valores y realizar consultas oficiales con la DGA o un agente aduanero certificado antes de tomar cualquier decisión comercial o realizar importaciones.
          </p>
          <div className="text-center text-sm">
            <Link href="/terms-of-use" legacyBehavior>
              <a className="text-dga-verde-oscuro hover:text-dga-verde-profundo hover:underline mr-4">Términos de Uso</a>
            </Link>
            <Link href="/privacy-policy" legacyBehavior>
              <a className="text-dga-verde-oscuro hover:text-dga-verde-profundo hover:underline">Política de Privacidad</a>
            </Link>
          </div>
        </section>
      </main>

      <footer className="text-center p-4 mt-8 text-dga-gris-neutro text-sm">
        <p>&copy; {new Date().getFullYear()} Calculadora de Impuestos Aduanales RD. Valores referenciales.</p>
        {/* AdSense - Footer */}
        <AdSenseComponent adSlot="YOUR_AD_SLOT_ID_FOOTER" />
      </footer>
    </>
  );
}
