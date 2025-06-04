import { useState, useEffect } from 'react';
import { formatUSD, formatDOP } from '../lib/formatters';
import { Switch } from '@headlessui/react'; // Using Headless UI for a nice toggle

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ResultsDisplay = ({ results, lastRateUpdateInfo }) => {
  const [showInDOP, setShowInDOP] = useState(false);

  if (!results) {
    return null; // Don't render if no results
  }

  const { valorFOB, impuestos, primeraPlaca, total, exchangeRateUsed } = results;

  const displayAmount = (amountObj) => {
    if (!amountObj) return showInDOP ? formatDOP(0) : formatUSD(0);
    return showInDOP ? formatDOP(amountObj.dop) : formatUSD(amountObj.usd);
  };

  const lastUpdatedText = () => {
    if (!lastRateUpdateInfo || !lastRateUpdateInfo.timestamp) return '';
    const minutesAgo = Math.round((Date.now() - lastRateUpdateInfo.timestamp) / (1000 * 60));
    if (minutesAgo < 1) return "(actualizada hace menos de un minuto)";
    if (minutesAgo === 1) return "(actualizada hace 1 minuto)";
    return `(actualizada hace ${minutesAgo} minutos)`;
  };
  
  return (
    <div className="mt-8 p-6 bg-dga-blanco rounded-xl shadow-xl border border-dga-verde-suave">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-dga-verde-profundo">Resultados del Cálculo</h3>
        <div className="flex items-center">
          <span className={`mr-3 text-sm font-medium ${!showInDOP ? 'text-dga-verde-oscuro' : 'text-dga-gris-neutro'}`}>USD</span>
          <Switch
            checked={showInDOP}
            onChange={setShowInDOP}
            className={classNames(
              showInDOP ? 'bg-dga-verde' : 'bg-gray-300',
              'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dga-verde-oscuro'
            )}
          >
            <span className="sr-only">Mostrar en DOP</span>
            <span
              aria-hidden="true"
              className={classNames(
                showInDOP ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
              )}
            />
          </Switch>
          <span className={`ml-3 text-sm font-medium ${showInDOP ? 'text-dga-verde-oscuro' : 'text-dga-gris-neutro'}`}>DOP</span>
        </div>
      </div>

      <div className="mb-4 text-sm text-dga-gris-neutro text-center">
        Tasa de cambio utilizada: <strong>1 USD = {parseFloat(exchangeRateUsed).toFixed(4)} DOP</strong> 
        {lastRateUpdateInfo && lastRateUpdateInfo.rateSource && (
            <span className="text-xs"> ({lastRateUpdateInfo.rateSource === 'fallback' ? 'Tasa de respaldo' : `Fuente: ${lastRateUpdateInfo.rateSource}`}, {lastUpdatedText()})</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-dga-verde-suave rounded-lg">
          <span className="font-medium text-dga-gris-oscuro">Valor FOB:</span>
          <span className="font-semibold text-dga-verde-profundo text-lg">{displayAmount(valorFOB)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-dga-verde-suave rounded-lg">
          <span className="font-medium text-dga-gris-oscuro">Impuestos Aduanales ({results.esDRCAFTA ? 'DR-CAFTA 18%' : 'General 29.85%'}):</span>
          <span className="font-semibold text-dga-verde-profundo text-lg">{displayAmount(impuestos)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-dga-verde-suave rounded-lg">
          <span className="font-medium text-dga-gris-oscuro">Primera Placa y Marbete:</span>
          <span className="font-semibold text-dga-verde-profundo text-lg">{displayAmount(primeraPlaca)}</span>
        </div>
        <hr className="my-3 border-dga-verde-menta"/>
        <div className="flex justify-between items-center p-3 bg-dga-verde-menta rounded-lg">
          <span className="font-bold text-dga-verde-profundo text-xl">TOTAL ESTIMADO:</span>
          <span className="font-bold text-dga-verde-profundo text-xl">{displayAmount(total)}</span>
        </div>
      </div>

      {/* Desglose detallado expandible - Placeholder */}
      {/* <div className="mt-4">
        <button className="text-sm text-dga-verde-oscuro hover:underline">Mostrar desglose detallado</button>
      </div> */}
    </div>
  );
};

export default ResultsDisplay;
