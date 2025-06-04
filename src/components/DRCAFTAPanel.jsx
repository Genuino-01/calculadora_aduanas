import { useState } from 'react';
import { formatUSD } from '../lib/formatters'; // If showing tax difference in USD

// Constants from calculations.js (could be imported or redefined if small)
const DR_CAFTA_TAX_RATE = 0.18; // 18%
const NON_DR_CAFTA_TAX_RATE = 0.2985; // 29.85%

// List of DR-CAFTA countries for the info text
const DR_CAFTA_INFO_COUNTRIES = "Estados Unidos, Canadá, y países de Centroamérica como Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua, además de República Dominicana.";


const DRCAFTAPanel = ({ esDRCAFTA, valorFOB_USD }) => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  if (typeof esDRCAFTA === 'undefined' || esDRCAFTA === null || typeof valorFOB_USD === 'undefined' || valorFOB_USD === null) {
    return null; // Don't render if data is not available
  }

  const taxRate = esDRCAFTA ? DR_CAFTA_TAX_RATE : NON_DR_CAFTA_TAX_RATE;
  const taxRateDisplay = `${(taxRate * 100).toFixed(2)}%`;

  // Optional: Calculate potential tax difference
  // const taxIfDRCAFTA = valorFOB_USD * DR_CAFTA_TAX_RATE;
  // const taxIfNotDRCAFTA = valorFOB_USD * NON_DR_CAFTA_TAX_RATE;
  // const difference = Math.abs(taxIfDRCAFTA - taxIfNotDRCAFTA);

  return (
    <div className="mt-6 p-4 bg-dga-blanco rounded-xl shadow-lg border-2 border-dga-verde-oscuro">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-dga-verde-profundo">Tratado DR-CAFTA</h4>
          {esDRCAFTA ? (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-dga-success text-white">
              <svg className="-ml-1 mr-1.5 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Elegible DR-CAFTA ({taxRateDisplay})
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-dga-warning text-white">
              <svg className="-ml-1 mr-1.5 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              No Elegible DR-CAFTA (Aplica tasa general {taxRateDisplay})
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          className="text-sm text-dga-verde-oscuro hover:text-dga-verde-profundo"
        >
          {isInfoExpanded ? 'Ocultar Info' : 'Más Info'}
        </button>
      </div>

      {/* Optional: Comparison visual - simple text for now
      {valorFOB_USD > 0 && (
        <div className="mt-2 text-sm text-dga-gris-neutro">
          <p>Impuesto estimado con DR-CAFTA: {formatUSD(taxIfDRCAFTA)}</p>
          <p>Impuesto estimado sin DR-CAFTA: {formatUSD(taxIfNotDRCAFTA)}</p>
          <p>Diferencia potencial: {formatUSD(difference)}</p>
        </div>
      )}
      */}

      {isInfoExpanded && (
        <div className="mt-3 pt-3 border-t border-dga-verde-menta">
          <p className="text-sm text-dga-gris-neutro">
            El Tratado de Libre Comercio entre República Dominicana, Centroamérica y Estados Unidos (DR-CAFTA) puede ofrecer tasas arancelarias reducidas para vehículos fabricados en países miembros.
          </p>
          <p className="text-sm text-dga-gris-neutro mt-1">
            Países comúnmente asociados con beneficios para vehículos bajo acuerdos similares (verificar elegibilidad específica): {DR_CAFTA_INFO_COUNTRIES}. La elegibilidad final depende de las regulaciones aduanales vigentes y el origen específico del vehículo.
          </p>
        </div>
      )}
    </div>
  );
};

export default DRCAFTAPanel;
