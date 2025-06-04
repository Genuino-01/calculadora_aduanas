import Head from 'next/head';
import { useEffect, useState } from 'react';
import { getExchangeRate, getCurrentRateInfo } from '../lib/currencyAPI';
import Calculator from '../components/Calculator';
import AdSenseComponent from '../components/AdSenseComponent';

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
            <span role="img" aria-label="car icon" className="text-4xl">🚗</span>
            <h1 className="text-4xl font-bold text-dga-verde-suave">Calculadora Impuestos de Vehículos</h1>
            <span role="img" aria-label="calculator icon" className="text-4xl">🧮</span>
          </div>
          <p className="text-lg text-dga-verde-menta mb-4">República Dominicana - Cálculo de aranceles e impuestos</p>
          {exchangeRate && (
            <div className="absolute top-4 right-4 bg-dga-blanco text-dga-verde-profundo text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
              1 USD = {parseFloat(exchangeRate).toFixed(2)} DOP
              {lastRateUpdate && <span className="text-xs block text-dga-gris-neutro">Actualizado: {lastRateUpdate}</span>}
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
      </main>

      <footer className="text-center p-4 mt-8 text-dga-gris-neutro text-sm">
        <p>&copy; {new Date().getFullYear()} Calculadora de Impuestos Aduanales RD. Valores referenciales.</p>
        {/* AdSense - Footer */}
        <AdSenseComponent adSlot="YOUR_AD_SLOT_ID_FOOTER" />
      </footer>
    </>
  );
}
