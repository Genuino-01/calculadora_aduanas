import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. Obtener todas las marcas únicas
export const getUniqueMarcas = async () => {
  console.log("[Supabase] Attempting to fetch unique marcas from 'vw_marcas' view...");
  try {
    // Querying the view 'vw_marcas' which should provide distinct brand names.
    // The view aliases "Marca" as "marca" (lowercase).
    const { data, error, status } = await supabase
      .from('vw_marcas') // Use the view
      .select('marca')   // Select the 'marca' column from the view
      .order('marca', { ascending: true }); // Order by the 'marca' column from the view

    if (error) {
      console.error('[Supabase] Error fetching marcas from vw_marcas:', { error, status });
      return [];
    }
    if (!data) {
      console.warn('[Supabase] No data array returned for marcas, but no explicit error. Status:', status);
      return [];
    }
    
    console.log(`[Supabase] Marcas query returned ${data.length} items. Status: ${status}`);
    // console.log('[Supabase] Raw marcas data from vw_marcas:', data);

    // The view already returns distinct marcas, so Set might be redundant but harmless.
    // The view vw_marcas aliases "Marca" as "marca" (lowercase).
    const marcas = data.map(item => item.marca).filter(Boolean); 
    
    console.log('[Supabase] Processed unique marcas from vw_marcas:', marcas.length > 0 ? marcas : 'No unique marcas found from vw_marcas.');
    return marcas; // Already unique from the view
  } catch (catchError) {
    console.error('[Supabase] Caught an unhandled exception in getUniqueMarcas:', catchError);
    return [];
  }
};

// 2. Obtener modelos por marca
export const getModelosByMarca = async (marca) => {
  if (!marca) return [];
  console.log(`[Supabase] Attempting to fetch modelos for marca: "${marca}" from 'base_de_datos_vehiculos'`);
  const { data, error, status } = await supabase
    .from('base_de_datos_vehiculos')
    .select('Modelo') // Corrected column name
    .eq('Marca', marca) // Corrected column name
    .order('Modelo', { ascending: true }); // Corrected column name

  if (error) {
    console.error(`[Supabase] Error fetching modelos for marca "${marca}":`, { error, status });
    return [];
  }
  if (!data) {
    console.warn(`[Supabase] No data array returned for modelos (marca "${marca}"), but no explicit error. Status:`, status);
    return [];
  }
  console.log(`[Supabase] Modelos query for marca "${marca}" returned ${data.length} items. Status: ${status}`);
  const modelos = data.map(item => item.Modelo).filter(Boolean);
  const uniqueModelos = [...new Set(modelos)];
  console.log(`[Supabase] Processed unique modelos for "${marca}":`, uniqueModelos.length > 0 ? uniqueModelos : 'No unique modelos found.');
  return uniqueModelos;
};

// 3. Obtener especificaciones por marca y modelo
export const getEspecificacionesByMarcaModelo = async (marca, modelo) => {
  if (!marca || !modelo) return [];
  console.log(`[Supabase] Attempting to fetch especificaciones for marca: "${marca}", modelo: "${modelo}" from 'base_de_datos_vehiculos'`);
  const { data, error, status } = await supabase
    .from('base_de_datos_vehiculos')
    .select('"Especificacion de Producto"') // Explicitly quote column name with spaces
    .eq('Marca', marca) // Corrected column name
    .eq('Modelo', modelo); // Corrected column name
    // .order('Especificacion de Producto', { ascending: true }); // Temporarily remove order to test

  if (error) {
    console.error(`[Supabase] Error fetching especificaciones for "${marca}" "${modelo}":`, { 
      message: error.message, 
      details: error.details, 
      hint: error.hint, 
      code: error.code, 
      status 
    });
    return [];
  }
  if (!data) {
    console.warn(`[Supabase] No data array returned for especificaciones (marca "${marca}", modelo "${modelo}"), but no explicit error. Status:`, status);
    return [];
  }
  console.log(`[Supabase] Especificaciones query for "${marca}" "${modelo}" (selecting '*') returned ${data.length} items. Status: ${status}`);
  if (data.length > 0) {
    // console.log('[Supabase] First item structure for especificaciones query:', data[0]); // Keep commented unless needed
  }
  const especificaciones = data.map(item => item['Especificacion de Producto']).filter(Boolean);
  const uniqueEspecificaciones = [...new Set(especificaciones)]; // Still good to ensure uniqueness client-side
  console.log(`[Supabase] Processed unique especificaciones for "${marca}" "${modelo}":`, uniqueEspecificaciones.length > 0 ? uniqueEspecificaciones : 'No unique especificaciones found.');
  return uniqueEspecificaciones;
};

// 4. Obtener años disponibles (opcionalmente filtrados por marca, modelo, especificación)
export const getAnosDisponibles = async (filters = {}) => {
  // console.log(`[Supabase] Fetching anos from 'base_de_datos_vehiculos' with filters:`, filters);
  let query = supabase.from('base_de_datos_vehiculos').select('Ano'); // Corrected column name
  
  if (filters.marca) query = query.eq('Marca', filters.marca); // Corrected column name
  if (filters.modelo) query = query.eq('Modelo', filters.modelo); // Corrected column name
  if (filters.especificacion) query = query.eq('Especificacion de Producto', filters.especificacion); // Corrected column name
  
  query = query.order('Ano', { ascending: false }); // Corrected column name

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching anos:', error);
    return [];
  }
  const anos = data.map(item => item.Ano).filter(Boolean);
  return [...new Set(anos)];
};

// 5. Obtener países únicos (opcionalmente filtrados)
export const getPaisesUnicos = async (filters = {}) => {
  // console.log(`[Supabase] Fetching paises from 'base_de_datos_vehiculos' with filters:`, filters);
  let query = supabase.from('base_de_datos_vehiculos').select('Pais'); // Corrected column name

  if (filters.marca) query = query.eq('Marca', filters.marca); // Corrected column name
  if (filters.modelo) query = query.eq('Modelo', filters.modelo); // Corrected column name
  if (filters.especificacion) query = query.eq('Especificacion de Producto', filters.especificacion); // Corrected column name
  if (filters.ano) query = query.eq('Ano', filters.ano); // Corrected column name

  query = query.order('Pais', { ascending: true }); // Corrected column name

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching paises:', error);
    return [];
  }
  const paises = data.map(item => item.Pais).filter(Boolean);
  return [...new Set(paises)];
};

// 6. Buscar valor de referencia por combinación exacta
export const getValorReferencia = async ({ marca, modelo, especificacion, ano, pais }) => {
  if (!marca || !modelo || !especificacion || !ano || !pais) {
    return null;
  }
  
  // console.log(`[Supabase] Fetching valor de referencia from 'base_de_datos_vehiculos' for:`, { marca, modelo, especificacion, ano, pais });
  const { data, error } = await supabase
    .from('base_de_datos_vehiculos')
    .select('Valor') // Corrected column name
    .eq('Marca', marca) // Corrected column name
    .eq('Modelo', modelo) // Corrected column name
    .eq('Especificacion de Producto', especificacion) // Corrected column name
    .eq('Ano', ano) // Corrected column name
    .eq('Pais', pais) // Corrected column name
    .limit(1);

  if (error) {
    console.error('Error fetching valor de referencia:', error);
    return null;
  }

  return data && data.length > 0 ? data[0].Valor : null; // Corrected column name access
};
