import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. Fetch initial data for dropdowns (marcas, anos, paises)
export const fetchInitialDropdownData = async () => {
  console.log("[Supabase] Attempting to fetch initial dropdown data via RPC 'obtener_dropdown_data'...");
  try {
    const { data, error, status } = await supabase.rpc('obtener_dropdown_data');

    if (error) {
      console.error('[Supabase] Error fetching initial dropdown data:', { error, status });
      return { marcas: [], anos: [], paises: [] };
    }
    if (!data) {
      console.warn('[Supabase] No data object returned for initial dropdown data, but no explicit error. Status:', status);
      return { marcas: [], anos: [], paises: [] };
    }
    
    console.log(`[Supabase] Initial dropdown data RPC returned. Status: ${status}`);
    console.log("[Supabase] Raw data from obtener_dropdown_data RPC:", data); // Explicitly log the data object
    // The RPC returns a single JSON object with keys: marcas, anos, paises
    // Ensure arrays are returned even if RPC gives null for a key
    return {
      marcas: data.marcas || [],
      anos: data.anos || [],
      paises: data.paises || [],
    };
  } catch (catchError) {
    console.error('[Supabase] Caught an unhandled exception in fetchInitialDropdownData:', catchError);
    return { marcas: [], anos: [], paises: [] };
  }
};

// 2. Obtener modelos por marca (using RPC)
// marca_param is expected to be lowercase as returned by vw_marcas / obtener_dropdown_data
export const getModelosByMarca = async (marca_param) => {
  if (!marca_param) return [];
  console.log(`[Supabase] Attempting to fetch modelos for marca: "${marca_param}" via RPC 'obtener_modelos_por_marca'`);
  try {
    const { data, error, status } = await supabase.rpc('obtener_modelos_por_marca', { marca_param });

    if (error) {
      console.error(`[Supabase] Error fetching modelos for marca "${marca_param}":`, { error, status });
      return [];
    }
    if (!data) {
      console.warn(`[Supabase] No data array returned for modelos (marca "${marca_param}"), but no explicit error. Status:`, status);
      return [];
    }
    console.log(`[Supabase] Modelos RPC for marca "${marca_param}" returned ${data.length} items. Status: ${status}`);
    return data; // RPC returns a JSON array of strings
  } catch (catchError) {
    console.error(`[Supabase] Caught an unhandled exception in getModelosByMarca for "${marca_param}":`, catchError);
    return [];
  }
};

// 3. Obtener especificaciones por marca y modelo (using RPC)
// marca_param and modelo_param are expected to be lowercase
export const getEspecificacionesByMarcaModelo = async (marca_param, modelo_param) => {
  if (!marca_param || !modelo_param) return [];
  console.log(`[Supabase] Attempting to fetch especificaciones for marca: "${marca_param}", modelo: "${modelo_param}" via RPC 'obtener_especificaciones'`);
  try {
    const { data, error, status } = await supabase.rpc('obtener_especificaciones', { marca_param, modelo_param });

    if (error) {
      console.error(`[Supabase] Error fetching especificaciones for "${marca_param}" "${modelo_param}":`, { error, status });
      return [];
    }
    if (!data) {
      console.warn(`[Supabase] No data array returned for especificaciones (marca "${marca_param}", modelo "${modelo_param}"), but no explicit error. Status:`, status);
      return [];
    }
    console.log(`[Supabase] Especificaciones RPC for "${marca_param}" "${modelo_param}" returned ${data.length} items. Status: ${status}`);
    return data; // RPC returns a JSON array of strings
  } catch (catchError) {
    console.error(`[Supabase] Caught an unhandled exception in getEspecificacionesByMarcaModelo for "${marca_param}" "${modelo_param}":`, catchError);
    return [];
  }
};

// 4. Obtener valor de referencia (using RPC 'obtener_vehiculo_exacto')
// Input parameters (marca, modelo, especificacion, pais) are from dropdowns (lowercase)
// They need to be uppercased for the RPC call as 'obtener_vehiculo_exacto' compares with table columns.
export const getValorReferencia = async ({ marca, modelo, especificacion, ano, pais }) => {
  if (!marca || !modelo || !especificacion || !ano || !pais) {
    return null;
  }
  
  const params = {
    p_marca: marca.toUpperCase(),
    p_modelo: modelo.toUpperCase(),
    p_especificacion: especificacion, // Especificacion case might vary, DB function uses ILIKE or direct match. Assuming direct match for now.
                                     // If 'Especificacion de Producto' in table is mixed case, this needs to be exact.
                                     // The SQL for obtener_vehiculo_exacto uses '=', so case must match.
                                     // Let's assume especificacion from dropdown is already in the correct case as stored in DB.
                                     // If not, this might need adjustment or the DB function `obtener_vehiculo_exacto` should use ILIKE for especificacion.
                                     // For safety, if especificacion is also consistently cased in DB (e.g. UPPER), then: p_especificacion: especificacion.toUpperCase()
    p_ano: parseInt(ano, 10),
    p_pais: pais.toUpperCase(),
  };
  console.log(`[Supabase] Fetching valor de referencia via RPC 'obtener_vehiculo_exacto' for:`, params);

  try {
    const { data, error, status } = await supabase.rpc('obtener_vehiculo_exacto', params).single();

    if (error) {
      if (error.code === 'PGRST116') { // "JSON object requested, multiple (or no) rows returned"
        console.warn('[Supabase] No exact vehicle found for valor de referencia or multiple returned. Params:', params);
        return null;
      }
      console.error('[Supabase] Error fetching valor de referencia:', { error, status, params });
      return null;
    }
    if (!data) {
      console.warn('[Supabase] No data object returned for valor de referencia, but no explicit error. Status:', status);
      return null;
    }
    console.log(`[Supabase] Valor de referencia RPC returned. Status: ${status}`, data);
    return data.valor; // RPC 'obtener_vehiculo_exacto' returns a 'valor' column
  } catch (catchError) {
    console.error('[Supabase] Caught an unhandled exception in getValorReferencia:', catchError);
    return null;
  }
};

// 5. Fetch Filtered Paises (using RPC 'obtener_paises_filtrados')
// Input parameters (marca, modelo, especificacion) are from dropdowns (likely lowercase from initialData)
// They need to be uppercased for the RPC call.
export const fetchFilteredPaises = async ({ marca, modelo, especificacion, ano }) => {
  if (!marca || !modelo || !especificacion || !ano) {
    return []; // Return empty array if any key filter is missing
  }

  const params = {
    p_marca: marca.toUpperCase(),
    p_modelo: modelo.toUpperCase(),
    p_especificacion: especificacion, // Assuming especificacion from dropdown is in the correct case for DB.
    p_ano: parseInt(ano, 10),
  };
  console.log(`[Supabase] Fetching filtered paises via RPC 'obtener_paises_filtrados' for:`, params);

  try {
    const { data, error, status } = await supabase.rpc('obtener_paises_filtrados', params);

    if (error) {
      console.error('[Supabase] Error fetching filtered paises:', { error, status, params });
      return [];
    }
    if (!data) {
      console.warn('[Supabase] No data array returned for filtered paises, but no explicit error. Status:', status);
      return [];
    }
    console.log(`[Supabase] Filtered paises RPC returned. Status: ${status}`, data);
    return data; // RPC returns a JSON array of country objects
  } catch (catchError) {
    console.error('[Supabase] Caught an unhandled exception in fetchFilteredPaises:', catchError);
    return [];
  }
};

// 6. Calculate import costs (using RPC 'calcular_costos_por_vehiculo')
// Input parameters (marca, modelo, especificacion, pais) are from dropdowns (likely lowercase)
// They need to be uppercased for the RPC call.
export const calculateImportCosts = async ({ marca, modelo, especificacion, ano, pais, costoFlete }) => {
  if (!marca || !modelo || !especificacion || !ano || !pais || typeof costoFlete === 'undefined') {
    console.warn('[Supabase] Missing parameters for calculateImportCosts');
    return null;
  }

  const params = {
    p_marca: marca.toUpperCase(),
    p_modelo: modelo.toUpperCase(),
    p_especificacion: especificacion, // Assuming especificacion from dropdown is in the correct case for DB.
    p_ano: parseInt(ano, 10),
    p_pais: pais.toUpperCase(),
    p_flete: parseFloat(costoFlete),
  };
  console.log(`[Supabase] Calculating import costs via RPC 'calcular_costos_por_vehiculo' with params:`, params);

  try {
    const { data, error, status } = await supabase.rpc('calcular_costos_por_vehiculo', params).single();

    if (error) {
       if (error.code === 'PGRST116') { 
        console.warn('[Supabase] No vehicle found for calculation or multiple returned. Params:', params);
        return null;
      }
      console.error('[Supabase] Error calculating import costs:', { error, status, params });
      return null;
    }
    if (!data) {
      console.warn('[Supabase] No data object returned from cost calculation, but no explicit error. Status:', status);
      return null;
    }
    console.log(`[Supabase] Import costs RPC returned. Status: ${status}`, data);
    // The RPC returns a single row with all calculated fields
    return data;
  } catch (catchError) {
    console.error('[Supabase] Caught an unhandled exception in calculateImportCosts:', catchError);
    return null;
  }
};

// --- Old functions (can be removed or kept for reference if Calculator.jsx isn't updated immediately) ---

// Original getUniqueMarcas (now replaced by fetchInitialDropdownData)
// export const getUniqueMarcas = async () => {
//   console.log("[Supabase] Attempting to fetch unique marcas from 'vw_marcas' view...");
//   try {
//     const { data, error, status } = await supabase
//       .from('vw_marcas') 
//       .select('marca')   
//       .order('marca', { ascending: true });
//     if (error) { /* ... */ return []; }
//     if (!data) { /* ... */ return []; }
//     const marcas = data.map(item => item.marca).filter(Boolean); 
//     const uniqueMarcas = [...new Set(marcas)];
//     return uniqueMarcas;
//   } catch (catchError) { /* ... */ return []; }
// };

// Original getAnosDisponibles (now replaced by fetchInitialDropdownData or direct vw_anos_disponibles query)
// export const getAnosDisponibles = async (filters = {}) => {
//   let query = supabase.from('base_de_datos_vehiculos_2').select('Ano');
//   if (filters.marca) query = query.eq('Marca', filters.marca.toUpperCase());
//   // ... other filters
//   query = query.order('Ano', { ascending: false });
//   const { data, error } = await query;
//   if (error) { /* ... */ return []; }
//   const anos = data.map(item => item.Ano).filter(Boolean);
//   return [...new Set(anos)];
// };

// Original getPaisesUnicos (now replaced by fetchInitialDropdownData or direct vw_paises query)
// export const getPaisesUnicos = async (filters = {}) => {
//   let query = supabase.from('base_de_datos_vehiculos_2').select('Pais');
//   if (filters.marca) query = query.eq('Marca', filters.marca.toUpperCase());
//   // ... other filters
//   query = query.order('Pais', { ascending: true });
//   const { data, error } = await query;
//   if (error) { /* ... */ return []; }
//   const paises = data.map(item => item.Pais).filter(Boolean);
//   return [...new Set(paises)];
// };
