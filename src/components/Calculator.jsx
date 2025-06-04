import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getUniqueMarcas,
  getModelosByMarca,
  getEspecificacionesByMarcaModelo,
  getAnosDisponibles,
  getPaisesUnicos,
  getValorReferencia,
} from '../lib/supabase';
import { getExchangeRate } from '../lib/currencyAPI';
import { calcularCostosImportacion } from '../lib/calculations';
import { formatUSD, parseNumber } from '../lib/formatters';
import ResultsDisplay from './ResultsDisplay';
import { getCurrentRateInfo as getAPIRateInfo } from '../lib/currencyAPI'; // Renamed to avoid conflict
import DRCAFTAPanel from './DRCAFTAPanel';
import VehicleSelector from './VehicleSelector'; // Import the new component

const Calculator = () => {
  // Form state
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedEspecificacion, setSelectedEspecificacion] = useState('');
  const [selectedAno, setSelectedAno] = useState('');
  const [selectedPais, setSelectedPais] = useState('');
  const [costoFlete, setCostoFlete] = useState('');
  
  const [valorReferencia, setValorReferencia] = useState(null);
  const [calculatedResults, setCalculatedResults] = useState(null);
  const [isLoadingValor, setIsLoadingValor] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentExchangeRate, setCurrentExchangeRate] = useState(null);
  const [lastRateUpdateDetails, setLastRateUpdateDetails] = useState(null);

  // Fetch initial exchange rate and its details
  useEffect(() => {
    const fetchInitialRate = async () => {
      const rate = await getExchangeRate();
      setCurrentExchangeRate(rate);
      const rateInfo = getAPIRateInfo(); // Get details like timestamp and source
      setLastRateUpdateDetails({
        timestamp: rateInfo.timestamp,
        // Determine source based on how currencyAPI sets it, or simplify
        rateSource: rate === 58.50 && rateInfo.timestamp === 0 ? 'fallback' : (rateInfo.isFallback ? 'fallback' : 'API/Cache') // Simplified source
      });
    };
    fetchInitialRate();
  }, []);

  // Data fetching for dropdowns using React Query
  const { data: marcas, isLoading: isLoadingMarcas } = useQuery({
    queryKey: ['marcas'],
    queryFn: getUniqueMarcas,
  });

  const { data: modelos, isLoading: isLoadingModelos } = useQuery({
    queryKey: ['modelos', selectedMarca],
    queryFn: () => getModelosByMarca(selectedMarca),
    enabled: !!selectedMarca, // Only run if selectedMarca is truthy
  });

  const { data: especificaciones, isLoading: isLoadingEspecificaciones } = useQuery({
    queryKey: ['especificaciones', selectedMarca, selectedModelo],
    queryFn: () => getEspecificacionesByMarcaModelo(selectedMarca, selectedModelo),
    enabled: !!selectedMarca && !!selectedModelo,
  });

  const { data: anos, isLoading: isLoadingAnos } = useQuery({
    queryKey: ['anos', selectedMarca, selectedModelo, selectedEspecificacion],
    queryFn: () => getAnosDisponibles({ marca: selectedMarca, modelo: selectedModelo, especificacion: selectedEspecificacion }),
    enabled: !!selectedMarca && !!selectedModelo && !!selectedEspecificacion,
  });

  const { data: paises, isLoading: isLoadingPaises } = useQuery({
    queryKey: ['paises', selectedMarca, selectedModelo, selectedEspecificacion, selectedAno],
    queryFn: () => getPaisesUnicos({ marca: selectedMarca, modelo: selectedModelo, especificacion: selectedEspecificacion, ano: selectedAno }),
    enabled: !!selectedMarca && !!selectedModelo && !!selectedEspecificacion && !!selectedAno,
  });

  // Effect to fetch valorReferencia when all vehicle selections are made
  useEffect(() => {
    if (selectedMarca && selectedModelo && selectedEspecificacion && selectedAno && selectedPais) {
      setIsLoadingValor(true);
      setValorReferencia(null); // Reset previous value
      getValorReferencia({
        marca: selectedMarca,
        modelo: selectedModelo,
        especificacion: selectedEspecificacion,
        ano: selectedAno,
        pais: selectedPais,
      })
        .then(valor => {
          setValorReferencia(valor);
        })
        .catch(error => {
          console.error("Error fetching valor de referencia:", error);
          setValorReferencia(null); // Ensure it's null on error
        })
        .finally(() => setIsLoadingValor(false));
    } else {
      setValorReferencia(null); // Clear if any selection is missing
    }
  }, [selectedMarca, selectedModelo, selectedEspecificacion, selectedAno, selectedPais]);

  // Reset dependent fields when a parent field changes
  useEffect(() => { setSelectedModelo(''); setSelectedEspecificacion(''); setSelectedAno(''); setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedMarca]);
  useEffect(() => { setSelectedEspecificacion(''); setSelectedAno(''); setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedModelo]);
  useEffect(() => { setSelectedAno(''); setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedEspecificacion]);
  useEffect(() => { setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedAno]);
  useEffect(() => { setValorReferencia(null); setCalculatedResults(null); }, [selectedPais]);


  const handleCalculate = async () => {
    if (!valorReferencia || !costoFlete || !currentExchangeRate || !selectedPais || !selectedAno) {
      alert('Por favor complete todos los campos requeridos y asegúrese de que el valor de referencia esté cargado.');
      return;
    }
    setIsCalculating(true);
    setCalculatedResults(null);
    try {
      const results = calcularCostosImportacion({
        valorReferencia: valorReferencia,
        costoFlete: parseNumber(costoFlete),
        paisFabricacion: selectedPais,
        anoFabricacion: selectedAno,
        exchangeRate: currentExchangeRate,
      });
      setCalculatedResults(results);
    } catch (error) {
      console.error("Error during calculation:", error);
      alert("Ocurrió un error durante el cálculo.");
    } finally {
      setIsCalculating(false);
    }
  };
  
  // renderSelect function is no longer needed as VehicleSelector will be used directly.

  return (
    <div className="bg-dga-blanco p-6 md:p-8 rounded-xl shadow-2xl border border-dga-verde-suave">
      <h2 className="text-3xl font-bold text-dga-verde-profundo mb-6 text-center">Formulario de Cálculo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <VehicleSelector id="marca" label="Marca del Vehículo" icon="🏭" selectedValue={selectedMarca} onChange={setSelectedMarca} options={marcas} isLoading={isLoadingMarcas} placeholder="Selecciona la marca..." />
        <VehicleSelector id="modelo" label="Modelo" icon="🚙" selectedValue={selectedModelo} onChange={setSelectedModelo} options={modelos} isLoading={isLoadingModelos} placeholder="Selecciona el modelo..." disabled={!selectedMarca} />
        <VehicleSelector id="especificacion" label="Especificación/Submodelo" icon="⚙️" selectedValue={selectedEspecificacion} onChange={setSelectedEspecificacion} options={especificaciones} isLoading={isLoadingEspecificaciones} placeholder="Selecciona la especificación..." disabled={!selectedModelo} />
        <VehicleSelector id="ano" label="Año de Fabricación" icon="📅" selectedValue={selectedAno} onChange={setSelectedAno} options={anos} isLoading={isLoadingAnos} placeholder="Selecciona el año..." disabled={!selectedEspecificacion} />
        <VehicleSelector id="pais" label="País de Fabricación" icon="🌍" selectedValue={selectedPais} onChange={setSelectedPais} options={paises} isLoading={isLoadingPaises} placeholder="Selecciona el país..." disabled={!selectedAno} />

        {/* The Valor de Referencia display field is removed from UI as per request. 
           The value is still fetched and used in calculations. 
           An empty div can be used to maintain grid structure if needed, or adjust grid cols.
           For a 2-column grid, if this was the 6th item, its removal might affect layout.
           Assuming the grid handles it or the flete input moves up.
           If the grid had an odd number of items, this might have been the last item in a row.
           The current grid is md:grid-cols-2. With 5 selectors + 1 (removed) + 1 flete, it was 7 items.
           Now it's 5 selectors + 1 flete = 6 items, which fits perfectly into md:grid-cols-2.
        */}
      </div>

      <div className="mt-4 md:col-span-2"> {/* Ensure flete input spans full width if it was intended to be on its own row, or adjust layout */}
        <label htmlFor="costoFlete" className="block text-sm font-medium text-dga-gris-neutro mb-1">
          <span role="img" aria-label="flete icon" className="mr-2">🚛</span>Costo de Flete (USD)
        </label>
        <input
          type="number"
          id="costoFlete"
          value={costoFlete}
          onChange={(e) => setCostoFlete(e.target.value)}
          placeholder="Ej: 800.00"
          className="w-full p-3 border border-dga-verde-menta rounded-lg shadow-sm focus:ring-2 focus:ring-dga-verde-oscuro focus:border-dga-verde-oscuro"
        />
        {/* Tooltip: "¿Qué es el flete?" - Add later if complex component is needed */}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleCalculate}
          disabled={isCalculating || isLoadingValor || !valorReferencia || !costoFlete}
          className="w-full md:w-auto bg-dga-verde-oscuro hover:bg-dga-verde-profundo text-white font-semibold py-3 px-12 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? 'Calculando...' : 'Calcular Impuestos'}
        </button>
      </div>

      {/* DR-CAFTA Panel Display */}
      {calculatedResults && (
        <DRCAFTAPanel 
          esDRCAFTA={calculatedResults.esDRCAFTA} 
          valorFOB_USD={calculatedResults.valorFOB ? calculatedResults.valorFOB.usd : 0} 
        />
      )}

      {/* Actual Results Display */}
      {calculatedResults && (
        <ResultsDisplay 
          results={calculatedResults} 
          lastRateUpdateInfo={lastRateUpdateDetails} 
        />
      )}
    </div>
  );
};

export default Calculator;
