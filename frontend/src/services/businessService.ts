import { supabase } from '../config/supabaseClient';

export interface Business {
  id?: string | number;
  categoria_id?: number | null;
  nombre_negocio: string;
  nombre_dueno?: string | null;
  direccion: string;
  horario?: string | null;
  descripcion?: string | null;
  telefono?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  tags?: string[] | null;
}

// Initial mock businesses in Durango, Mexico.
export const MOCK_BUSINESSES: Business[] = [];

const LOCAL_STORAGE_KEY = 'durango_local_businesses';

/**
 * Get all businesses from:
 * 1. Supabase (if configured)
 * 2. LocalStorage (businesses registered locally)
 * 3. Mock data (guarantees the map has content)
 */
export async function getBusinesses(): Promise<Business[]> {
  let supabaseBusinesses: Business[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comercios')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching businesses from Supabase:', error);
      } else if (data) {
        // Map Supabase fields to our Business model structure
        supabaseBusinesses = data.map((b: any) => ({
          id: b.id,
          categoria_id: b.categoria_id,
          nombre_negocio: b.nombre_negocio,
          nombre_dueno: b.nombre_dueno,
          direccion: b.direccion,
          horario: b.horario,
          telefono: b.telefono || undefined,
          tags: b.tags || [],
          latitud: Number(b.latitud),
          longitud: Number(b.longitud),
          descripcion: b.descripcion || undefined
        }));
      }
    } catch (e) {
      console.error('Failed to contact Supabase server:', e);
    }
  }

  // Retrieve locally saved businesses
  let localBusinesses: Business[] = [];
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawLocal) {
      localBusinesses = JSON.parse(rawLocal);
    }
  } catch (e) {
    console.error('Error parsing local storage businesses:', e);
  }

  // Combine lists, removing duplicates based on unique fields if necessary.
  // We place Supabase businesses first, then locally registered, then mocks.
  const combined = [...supabaseBusinesses, ...localBusinesses, ...MOCK_BUSINESSES];
  
  // Deduplicate by name + address to avoid double entries
  const seen = new Set<string>();
  return combined.filter(b => {
    const key = `${b.nombre_negocio?.toLowerCase().trim()}|${b.direccion?.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Register a new business:
 * 1. Inserts into Supabase database (if configured)
 * 2. Saves to localStorage as backup/local registry
 */
export async function saveBusiness(business: Omit<Business, 'id'>): Promise<Business> {
  let savedInCloud = false;
  const newBusiness: Business = {
    ...business,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'local-' + Date.now()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comercios')
        .insert([
          {
            categoria_id: newBusiness.categoria_id,
            nombre_negocio: newBusiness.nombre_negocio,
            nombre_dueno: newBusiness.nombre_dueno,
            direccion: newBusiness.direccion,
            horario: newBusiness.horario,
            descripcion: newBusiness.descripcion,
            telefono: newBusiness.telefono,
            latitud: newBusiness.latitud,
            longitud: newBusiness.longitud,
            tags: newBusiness.tags
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving to Supabase:', error.message);
      } else if (data && data[0]) {
        savedInCloud = true;
        // Update newBusiness with the cloud generated ID
        newBusiness.id = data[0].id;
        
      }
    } catch (e) {
      console.error('Supabase connection error during save:', e);
    }
  }

  // 2. Save to localStorage to guarantee local presence
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    const localList: Business[] = rawLocal ? JSON.parse(rawLocal) : [];
    
    // Check if it already exists locally
    const exists = localList.some(
      b => b.nombre_negocio.toLowerCase() === newBusiness.nombre_negocio.toLowerCase() && 
           b.direccion.toLowerCase() === newBusiness.direccion.toLowerCase()
    );
    
    if (!exists) {
      localList.unshift(newBusiness);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
    }
  } catch (e) {
    console.error('Error saving business to local storage:', e);
  }

  return newBusiness;
}
