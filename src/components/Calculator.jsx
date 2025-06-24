import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchInitialDropdownData,
  getModelosByMarca,
  getEspecificacionesByMarcaModelo,
  getValorReferencia,
  calculateImportCosts, // New RPC-based calculation
  fetchFilteredPaises // New RPC for filtered paises
} from '../lib/supabase';
// Removed: getExchangeRate, calcularCostosImportacion (client-side), getAPIRateInfo
import { parseNumber } from '../lib/formatters'; // formatUSD is used in ResultsDisplay
import ResultsDisplay from './ResultsDisplay';
import DRCAFTAPanel from './DRCAFTAPanel';
import VehicleSelector from './VehicleSelector';

const Calculator = () => {
  // Form state
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedEspecificacion, setSelectedEspecificacion] = useState('');
  const [selectedAno, setSelectedAno] = useState('');
  const [selectedPais, setSelectedPais] = useState(''); // This will store the country name (string)
  const [costoFlete, setCostoFlete] = useState('');
  
  // Data state from Supabase
  const [valorReferencia, setValorReferencia] = useState(null);
  const [calculatedResults, setCalculatedResults] = useState(null);
  const [isLoadingValor, setIsLoadingValor] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationDone, setCalculationDone] = useState(false); // Added state for search status

  // Fetch initial dropdown data (marcas, anos - paises will be fetched separately)
  const { data: initialData, isLoading: isLoadingInitialData } = useQuery({
    queryKey: ['initialDropdownData'],
    queryFn: fetchInitialDropdownData, // This RPC now only needs to return marcas and anos effectively
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const marcas = initialData?.marcas || [];
  const anos = initialData?.anos || [];
  // paisesOptions will now come from a separate query

  // Fetch modelos when marca changes
  const { data: modelos, isLoading: isLoadingModelos } = useQuery({
    queryKey: ['modelos', selectedMarca],
    queryFn: () => getModelosByMarca(selectedMarca), // selectedMarca is lowercase from vw_marcas
    enabled: !!selectedMarca,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch especificaciones when marca and modelo change
  const { data: especificaciones, isLoading: isLoadingEspecificaciones } = useQuery({
    queryKey: ['especificaciones', selectedMarca, selectedModelo],
    queryFn: () => getEspecificacionesByMarcaModelo(selectedMarca, selectedModelo), // selectedMarca, selectedModelo are lowercase
    enabled: !!selectedMarca && !!selectedModelo,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch filtered paises when marca, modelo, especificacion, and ano change
  const { data: filteredPaisesData, isLoading: isLoadingFilteredPaises } = useQuery({
    queryKey: ['filteredPaises', selectedMarca, selectedModelo, selectedEspecificacion, selectedAno],
    queryFn: () => fetchFilteredPaises({ 
      marca: selectedMarca, 
      modelo: selectedModelo, 
      especificacion: selectedEspecificacion, 
      ano: selectedAno 
    }),
    enabled: !!selectedMarca && !!selectedModelo && !!selectedEspecificacion && !!selectedAno,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const paisesOptions = filteredPaisesData?.map(p => p.pais) || [];
  console.log("[Calculator.jsx] filteredPaisesOptions for VehicleSelector:", paisesOptions);


  // Effect to fetch valorReferencia when all vehicle selections are made
  useEffect(() => {
    if (selectedMarca && selectedModelo && selectedEspecificacion && selectedAno && selectedPais) {
      setIsLoadingValor(true);
      setValorReferencia(null);
      getValorReferencia({ // This function now calls the RPC 'obtener_vehiculo_exacto'
        marca: selectedMarca,         // Will be uppercased in supabase.js
        modelo: selectedModelo,       // Will be uppercased in supabase.js
        especificacion: selectedEspecificacion, // Case needs to match DB or RPC needs ILIKE
        ano: selectedAno,
        pais: selectedPais,           // Will be uppercased in supabase.js
      })
        .then(valor => {
          setValorReferencia(valor); // RPC returns just the 'valor'
        })
        .catch(error => {
          console.error("Error fetching valor de referencia:", error);
          setValorReferencia(null);
        })
        .finally(() => setIsLoadingValor(false));
    } else {
      setValorReferencia(null);
    }
  }, [selectedMarca, selectedModelo, selectedEspecificacion, selectedAno, selectedPais]);

  // Reset dependent fields
  useEffect(() => { setSelectedModelo(''); setSelectedEspecificacion(''); setSelectedAno(''); setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedMarca]);
  useEffect(() => { setSelectedEspecificacion(''); setSelectedAno(''); setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedModelo]);
  useEffect(() => { setSelectedAno(''); setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedEspecificacion]);
  useEffect(() => { setSelectedPais(''); setValorReferencia(null); setCalculatedResults(null); }, [selectedAno]);
  useEffect(() => { setValorReferencia(null); setCalculatedResults(null); }, [selectedPais]);


  const handleCalculate = async () => {
    if (!selectedMarca || !selectedModelo || !selectedEspecificacion || !selectedAno || !selectedPais || !costoFlete) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }
    
    setIsCalculating(true);
    setCalculatedResults(null);
    try {
      const rpcResults = await calculateImportCosts({
        marca: selectedMarca,
        modelo: selectedModelo,
        especificacion: selectedEspecificacion,
        ano: selectedAno,
        pais: selectedPais,
        costoFlete: parseNumber(costoFlete),
      });

      if (rpcResults) {
        // Log the exchange rate used in the calculation
        console.log('Exchange rate used in calculation (from Supabase RPC):', rpcResults.tasa_cambio_utilizada);
        
        // Adapt rpcResults to the structure expected by ResultsDisplay and DRCAFTAPanel
        const adaptedResults = {
          valorFOB: { usd: rpcResults.valor_fob_usd, dop: rpcResults.valor_fob_dop },
          impuestos: { usd: rpcResults.impuestos_usd, dop: rpcResults.impuestos_dop },
          primeraPlaca: { usd: rpcResults.primera_placa_usd, dop: rpcResults.primera_placa_dop },
          total: { usd: rpcResults.total_usd, dop: rpcResults.total_dop },
          exchangeRateUsed: rpcResults.tasa_cambio_utilizada,
          esDRCAFTA: rpcResults.es_dr_cafta_bool,
          // Pass through other potentially useful data from RPC
          valorReferenciaOriginal: { usd: rpcResults.valor_referencia_usd, dop: rpcResults.valor_referencia_dop },
          seguro: { usd: rpcResults.seguro_usd, dop: rpcResults.seguro_dop },
          flete: { usd: rpcResults.flete_usd, dop: rpcResults.flete_dop },
          marbete: { usd: rpcResults.marbete_usd, dop: rpcResults.marbete_dop },
          ccVehiculo: rpcResults.cc_vehiculo,
          porcentajeImpuesto: rpcResults.porcentaje_impuesto,
          porcentajePrimeraPlaca: rpcResults.porcentaje_primera_placa,
        };
        setCalculatedResults(adaptedResults);
        setCalculationDone(true); // Set calculation as done
      } else {
        alert("No se pudieron calcular los costos. Verifique los datos del vehículo o intente más tarde.");
      }
    } catch (error) {
      console.error("Error during RPC calculation:", error);
      alert("Ocurrió un error durante el cálculo.");
    } finally {
      setIsCalculating(false);
    }
  };
  
  const handleNewSearch = () => {
    window.location.reload(); // Reload the page to reset everything
  };

  return (
    <div className="bg-dga-blanco p-6 md:p-8 rounded-xl shadow-2xl border border-dga-verde-suave">
      <h2 className="text-2xl sm:text-3xl font-bold text-dga-verde-profundo mb-6 text-center">Introduce los Datos del Vehículo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <VehicleSelector id="marca" label="Marca del Vehículo" icon="🏭" selectedValue={selectedMarca} onChange={setSelectedMarca} options={marcas} isLoading={isLoadingInitialData} placeholder="Selecciona la marca..." />
        <VehicleSelector id="modelo" label="Modelo" icon="🚙" selectedValue={selectedModelo} onChange={setSelectedModelo} options={modelos || []} isLoading={isLoadingModelos} placeholder="Selecciona el modelo..." disabled={!selectedMarca || isLoadingModelos} />
        <VehicleSelector id="especificacion" label="Especificación/Submodelo" icon="⚙️" selectedValue={selectedEspecificacion} onChange={setSelectedEspecificacion} options={especificaciones || []} isLoading={isLoadingEspecificaciones} placeholder="Selecciona la especificación..." disabled={!selectedModelo || isLoadingEspecificaciones} />
        <VehicleSelector id="ano" label="Año de Fabricación" icon="📅" selectedValue={selectedAno} onChange={setSelectedAno} options={anos} isLoading={isLoadingInitialData} placeholder="Selecciona el año..." disabled={!selectedEspecificacion || isLoadingInitialData} />
        <VehicleSelector id="pais" label="País de Fabricación" icon="🌍" selectedValue={selectedPais} onChange={setSelectedPais} options={paisesOptions} isLoading={isLoadingFilteredPaises} placeholder="Selecciona el país..." disabled={!selectedAno || isLoadingFilteredPaises || !selectedEspecificacion} />
      </div>

      <div className="mt-4 md:col-span-2">
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
      </div>

      <div className="mt-8 text-center">
        {calculationDone ? (
          <button
            onClick={handleNewSearch}
            className="w-full md:w-auto bg-dga-verde-oscuro hover:bg-dga-verde-profundo text-white font-bold py-3 px-12 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Nueva Búsqueda
          </button>
        ) : (
          <button
            onClick={handleCalculate}
            disabled={isCalculating || isLoadingValor || !selectedMarca || !selectedModelo || !selectedEspecificacion || !selectedAno || !selectedPais || !costoFlete}
            className="w-full md:w-auto bg-dga-verde-oscuro hover:bg-dga-verde-profundo text-white font-semibold py-3 px-12 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Calculando...' : 'Calcular Impuestos'}
          </button>
        )}
      </div>

      {calculatedResults && (
        <DRCAFTAPanel 
          esDRCAFTA={calculatedResults.esDRCAFTA} 
          valorFOB_USD={calculatedResults.valorFOB?.usd || 0} 
        />
      )}

      {calculatedResults && (
        <ResultsDisplay 
          results={calculatedResults} 
          lastRateUpdateInfo={{ 
            timestamp: Date.now(), 
            rateSource: `DB RPC (Tasa: ${calculatedResults.exchangeRateUsed})` 
          }} 
        />
      )}
    </div>
  );
};

export default Calculator;
