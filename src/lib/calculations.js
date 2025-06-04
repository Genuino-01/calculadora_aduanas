import { parseNumber } from './formatters'; // For parsing inputs if needed

// Constants for calculations
const FOB_INSURANCE_PERCENTAGE = 0.02; // 2% for insurance part of FOB
const DR_CAFTA_TAX_RATE = 0.18; // 18%
const NON_DR_CAFTA_TAX_RATE = 0.2985; // 29.85%
const FIRST_PLATE_TAX_RATE_GENERAL = 0.18; // General rate for (Valor FOB * X%) part of "Primera Placa", as CC is not defined.
const MARBETE_UNDER_5_YEARS = 3000; // RD$
const MARBETE_5_YEARS_OR_OLDER = 1500; // RD$

// DR-CAFTA eligible countries (based on common vehicle origins for chasis 1,4,5,7)
// Chasis digit: 1,4,5 (USA), 7 (Canada). Mexico (3) is sometimes included in similar contexts but not specified here.
// This list might need refinement based on official DGA rules.
const DR_CAFTA_COUNTRIES = ['ESTADOS UNIDOS', 'USA', 'UNITED STATES', 'CANADA', 'CANADÁ']; // Add more variations/exact names from DB

// 1. Determinar si es DR-CAFTA
// Based on country of manufacture. The chasis number logic is simplified to country.
export const determinarDRCAFTA = (paisFabricacion) => {
  if (!paisFabricacion || typeof paisFabricacion !== 'string') return false;
  return DR_CAFTA_COUNTRIES.includes(paisFabricacion.toUpperCase());
};

// 2. Calcular Valor FOB (USD)
export const calcularValorFOB_USD = (valorReferencia, costoFlete) => {
  const valRef = parseNumber(valorReferencia);
  const flete = parseNumber(costoFlete);

  if (isNaN(valRef) || isNaN(flete) || valRef < 0 || flete < 0) {
    // console.error("Invalid input for calcularValorFOB_USD:", { valorReferencia, costoFlete });
    return 0;
  }
  return valRef + (valRef * FOB_INSURANCE_PERCENTAGE) + flete;
};

// 3. Calcular Impuestos (USD)
export const calcularImpuestos_USD = (valorFOB_USD, esDRCAFTA) => {
  if (isNaN(valorFOB_USD) || valorFOB_USD < 0) return 0;
  const rate = esDRCAFTA ? DR_CAFTA_TAX_RATE : NON_DR_CAFTA_TAX_RATE;
  return valorFOB_USD * rate;
};

// 4. Calcular Primera Placa (USD)
// antiguedadVehiculo is in years
export const calcularPrimeraPlaca_USD = (valorFOB_USD, antiguedadVehiculo, exchangeRate) => {
  if (isNaN(valorFOB_USD) || valorFOB_USD < 0 || isNaN(antiguedadVehiculo) || antiguedadVehiculo < 0 || !exchangeRate || exchangeRate <= 0) {
    return 0;
  }

  const impuestoMatriculacion_USD = valorFOB_USD * FIRST_PLATE_TAX_RATE_GENERAL;
  
  let marbete_DOP = MARBETE_5_YEARS_OR_OLDER;
  if (antiguedadVehiculo < 5) {
    marbete_DOP = MARBETE_UNDER_5_YEARS;
  }
  const marbete_USD = marbete_DOP / exchangeRate;

  return impuestoMatriculacion_USD + marbete_USD;
};

// Helper to calculate vehicle age
export const calcularAntiguedadVehiculo = (anoFabricacion) => {
  if (!anoFabricacion || isNaN(parseInt(anoFabricacion))) return 0;
  const currentYear = new Date().getFullYear();
  return currentYear - parseInt(anoFabricacion);
};

// 5. Función principal para realizar todos los cálculos
export const calcularCostosImportacion = ({
  valorReferencia, // number or string
  costoFlete,      // number or string
  paisFabricacion, // string
  anoFabricacion,  // number or string
  exchangeRate     // number (DOP per USD)
}) => {
  const valRef = parseNumber(valorReferencia);
  const flete = parseNumber(costoFlete);
  const ano = parseInt(anoFabricacion);

  if (isNaN(valRef) || valRef < 0 || 
      isNaN(flete) || flete < 0 || 
      !paisFabricacion || 
      isNaN(ano) || ano <= 1900 || // Basic year validation
      !exchangeRate || exchangeRate <= 0) {
    console.error('Invalid input for calcularCostosImportacion', { valorReferencia, costoFlete, paisFabricacion, anoFabricacion, exchangeRate });
    // Return zeroed or error structure
    return {
      valorFOB: { usd: 0, dop: 0 },
      impuestos: { usd: 0, dop: 0 },
      primeraPlaca: { usd: 0, dop: 0 },
      total: { usd: 0, dop: 0 },
      esDRCAFTA: false,
      antiguedad: 0,
      error: "Invalid input data"
    };
  }

  const esDRCAFTA = determinarDRCAFTA(paisFabricacion);
  const antiguedad = calcularAntiguedadVehiculo(ano);

  const valorFOB_USD = calcularValorFOB_USD(valRef, flete);
  const impuestos_USD = calcularImpuestos_USD(valorFOB_USD, esDRCAFTA);
  const primeraPlaca_USD = calcularPrimeraPlaca_USD(valorFOB_USD, antiguedad, exchangeRate);
  // Corrected total: sum of taxes and fees, not including FOB value itself.
  const total_USD = impuestos_USD + primeraPlaca_USD;

  return {
    valorFOB: {
      usd: valorFOB_USD,
      dop: valorFOB_USD * exchangeRate,
    },
    impuestos: {
      usd: impuestos_USD,
      dop: impuestos_USD * exchangeRate,
    },
    primeraPlaca: {
      usd: primeraPlaca_USD,
      dop: primeraPlaca_USD * exchangeRate,
    },
    total: {
      usd: total_USD,
      dop: total_USD * exchangeRate,
    },
    esDRCAFTA,
    antiguedad,
    exchangeRateUsed: exchangeRate
  };
};
