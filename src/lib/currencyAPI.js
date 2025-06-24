import axios from 'axios';

const EXCHANGE_RATE_API_KEY = '35455465c2a837027cf3b443'; // As provided in the prompt
const BCRD_API_URL = 'https://api.bcrd.gob.do/indicators/exchange-rate';
const EXCHANGERATE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`;
const FALLBACK_RATE = 58.50; // Manual fallback rate
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

let cachedRate = null;
let lastFetchTime = 0;

// Helper to get the selling rate for USD from BCRD data
const getSellingRateFromBCRD = (data) => {
  if (!data || !Array.isArray(data)) return null;
  // Assuming 'Dólar Estadounidense' and we need the 'venta' (selling) rate.
  // The exact structure might need verification against actual API response.
  // This is a common pattern: find the USD object, then its selling rate.
  // Example: { "category": "Mercado Cambiario Spot", "value": 58.9536, "indicatorId": 4050, "indicatorName": "Dólar Estadounidense Venta", ... }
  const usdSellingRateEntry = data.find(
    (entry) =>
      entry.indicatorName &&
      entry.indicatorName.toLowerCase().includes('dólar estadounidense') &&
      entry.indicatorName.toLowerCase().includes('venta')
  );
  return usdSellingRateEntry ? usdSellingRateEntry.value : null;
};


const fetchFromBCRD = async () => {
  try {
    const response = await axios.get(BCRD_API_URL, { timeout: 5000 }); // 5-second timeout
    // The BCRD API returns an array of indicators. We need to find the USD selling rate.
    // The structure is typically: { data: [ { value: X, indicatorName: "Dólar Estadounidense Venta ..." } ] }
    // Or it might be directly an array. Let's assume response.data is the array of indicators.
    const rate = getSellingRateFromBCRD(response.data.data || response.data);
    if (rate) {
      console.log('Fetched rate from BCRD:', rate);
      return parseFloat(rate);
    }
    console.warn('Could not find USD selling rate in BCRD response.');
    return null;
  } catch (error) {
    console.error('Error fetching from BCRD:', error.message);
    return null;
  }
};

const fetchFromExchangeRateAPI = async () => {
  try {
    const response = await axios.get(EXCHANGERATE_API_URL, { timeout: 5000 });
    if (response.data && response.data.conversion_rates && response.data.conversion_rates.DOP) {
      const rate = parseFloat(response.data.conversion_rates.DOP);
      console.log('Fetched rate from ExchangeRate-API:', rate);
      return rate;
    }
    console.warn('Could not find DOP rate in ExchangeRate-API response.');
    return null;
  } catch (error) {
    console.error('Error fetching from ExchangeRate-API:', error.message);
    return null;
  }
};

export const getExchangeRate = async () => {
  const now = Date.now();
  if (cachedRate && (now - lastFetchTime < CACHE_DURATION_MS)) {
    console.log('Using cached exchange rate:', cachedRate);
    return cachedRate;
  }

  let rate = await fetchFromBCRD();

  if (!rate) {
    console.log('BCRD fetch failed or rate not found, trying ExchangeRate-API...');
    rate = await fetchFromExchangeRateAPI();
  }

  if (!rate) {
    console.warn('All API fetches failed, using manual fallback rate.');
    rate = FALLBACK_RATE;
  }

  cachedRate = rate;
  lastFetchTime = now;
  console.log('Client-side exchange rate set to:', rate, '(Note: This rate may differ from the one used in calculations by the server)');
  return rate;
};

// 4. Función para convertir USD a DOP (using the fetched rate)
export const convertUSDtoDOP = (amountUSD, rate) => {
  if (typeof amountUSD !== 'number' || typeof rate !== 'number' || isNaN(amountUSD) || isNaN(rate)) {
    return 0;
  }
  return amountUSD * rate;
};

// Function to get the current rate and last update time for display
export const getCurrentRateInfo = () => {
  return {
    rate: cachedRate,
    lastFetched: lastFetchTime > 0 ? new Date(lastFetchTime) : null,
    isFallback: cachedRate === FALLBACK_RATE && lastFetchTime === 0 // A simple way to check if it's the initial fallback
  };
};

// Pre-fetch the rate on module load, but don't block.
// This helps in having a rate ready sooner for the first request.
getExchangeRate().catch(err => console.error("Initial exchange rate fetch failed:", err));
