import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MapPin, Phone, Clock, Navigation, Star, Sparkles, Search, Store } from 'lucide-react';
import { APIProvider, Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { getBusinesses } from '../services/businessService';

const CATEGORIES = [
  { name: 'Todos', color: 'gray' },
  { name: 'Antojitos', color: 'orange' },
  { name: 'Mezcal', color: 'purple' },
  { name: 'Artesanías', color: 'pink' },
  { name: 'Abarrotes', color: 'blue' },
];

const durangoCenter = {
  lat: 24.027729,
  lng: -104.653027,
};

export default function Explorar({ onBack }) {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [googlePlaces, setGooglePlaces] = useState([]);

  const [tempApiKey, setTempApiKey] = useState(() => {
    return sessionStorage.getItem('temp_google_maps_api_key') || '';
  });

  const activeApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || tempApiKey;

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getBusinesses();
        setBusinesses(data);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getCategoriaName = (id) => {
    switch(id) {
      case 11: return 'Antojitos';
      case 12: return 'Mezcal';
      case 13: return 'Artesanías';
      case 14: return 'Abarrotes';
      default: return 'Desconocido';
    }
  };

  // Filtrar por categoría y búsqueda
  const dbFiltered = businesses.filter(b => {
    const matchesCat = selectedCategory === 'Todos' || 
      getCategoriaName(b.categoria_id).toLowerCase().includes(selectedCategory.toLowerCase()) ||
      b.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    const matchesSearch = b.nombre_negocio.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoriaName(b.categoria_id).toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  // Combinar los de la DB con los de Google Places (sin duplicar nombres) y aplicar búsqueda
  const filteredBusinesses = [
    ...dbFiltered,
    ...googlePlaces.filter(gp => {
      const isDuplicate = businesses.some(db => db.nombre_negocio.toLowerCase() === gp.nombre_negocio.toLowerCase());
      const matchesCat = selectedCategory === 'Todos' || getCategoriaName(gp.categoria_id).toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = gp.nombre_negocio.toLowerCase().includes(searchQuery.toLowerCase()) || gp.direccion.toLowerCase().includes(searchQuery.toLowerCase());
      return !isDuplicate && matchesCat && matchesSearch;
    })
  ];

  const handleMarkerClick = (business) => {
    setSelectedBusiness(business);
  };

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="bg-[#1e2530]/95 backdrop-blur border-b border-white/10 px-6 py-4 z-10 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="size-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Descubre Durango</h1>
              <p className="text-sm text-slate-400">
                {isLoading ? 'Cargando comercios...' : `${filteredBusinesses.length} negocios encontrados`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Buscar negocio, categoría o ubicación..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-400 transition-colors" 
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-1.5 rounded-full font-medium text-[13px] flex items-center gap-2 whitespace-nowrap transition-all border ${
                  selectedCategory === category.name
                    ? 'bg-white/10 border-white/20 text-slate-200 shadow-sm'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                {category.name === 'Todos' && <MapPin className="size-3.5" />}
                {category.name === 'Antojitos' && '🌮'}
                {category.name === 'Mezcal' && '🥃'}
                {category.name === 'Artesanías' && '🏺'}
                {category.name === 'Abarrotes' && '🏪'}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Map Area */}
        <div className="flex-1 relative bg-gray-100 h-full">
          {activeApiKey ? (
            <APIProvider apiKey={activeApiKey} libraries={['places']}>
              <Map
                defaultZoom={selectedBusiness ? 16 : 14}
                defaultCenter={selectedBusiness ? { lat: selectedBusiness.latitud, lng: selectedBusiness.longitud } : durangoCenter}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
              >
                <GooglePlacesFetcher onPlacesFound={setGooglePlaces} />
                {filteredBusinesses.map((business) => (
                  <Marker
                    key={business.id}
                    position={{ lat: business.latitud, lng: business.longitud }}
                    onClick={() => handleMarkerClick(business)}
                    title={business.nombre_negocio}
                  />
                ))}

                {selectedBusiness && (
                  <InfoWindow
                    position={{ lat: selectedBusiness.latitud, lng: selectedBusiness.longitud }}
                    onCloseClick={() => setSelectedBusiness(null)}
                  >
                    <div className="p-2 max-w-[200px] text-slate-800">
                      <h4 className="font-bold text-sm">{selectedBusiness.nombre_negocio}</h4>
                      <p className="text-xs text-slate-600">{getCategoriaName(selectedBusiness.categoria_id)}</p>
                      <p className="text-xs mt-1 text-slate-500 font-semibold">{selectedBusiness.horario}</p>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              <div className="text-center space-y-4 z-10 px-6">
                <MapPin className="size-20 text-purple-600 mx-auto opacity-40 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-800">Mapa de Durango (Modo Simulación)</h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  Viendo ubicaciones en Durango de forma interactiva. Registra una clave de Google Maps en la esquina superior para activar la visualización real.
                </p>
              </div>

              {filteredBusinesses.map((business) => {
                const scaleX = (business.longitud - durangoCenter.lng) * 4000;
                const scaleY = (business.latitud - durangoCenter.lat) * 4000;
                const styleLeft = `calc(50% + ${scaleX}px)`;
                const styleTop = `calc(50% - ${scaleY}px)`;

                return (
                  <button
                    key={business.id}
                    onClick={() => setSelectedBusiness(business)}
                    style={{ left: styleLeft, top: styleTop }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-lg hover:scale-125 transition-transform cursor-pointer border-4 border-white ${
                      selectedBusiness?.id === business.id
                        ? 'size-14 bg-purple-600 text-white z-20'
                        : 'size-12 bg-white hover:bg-orange-50 text-orange-600 z-10'
                    }`}
                  >
                    <MapPin className="size-6" />
                  </button>
                );
              })}
            </div>
          )}
          
          {/* API Key Configuration Overlay */}
          {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <div className="absolute top-4 left-4 right-4 md:left-auto md:w-96 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 border border-orange-200 z-20 space-y-3">
              <div className="flex items-center gap-2 text-orange-700 font-semibold">
                <Sparkles className="size-4" />
                <span className="text-sm">Google Maps API Key</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ingresa una clave de Google Maps temporal para cargar la visualización oficial:
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => {
                    setTempApiKey(e.target.value);
                    sessionStorage.setItem('temp_google_maps_api_key', e.target.value);
                  }}
                  className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-purple-600 text-gray-900"
                />
                {tempApiKey && (
                  <button
                    onClick={() => {
                      setTempApiKey('');
                      sessionStorage.removeItem('temp_google_maps_api_key');
                    }}
                    className="text-xs text-red-500 font-medium px-1"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Business List Sidebar */}
        <div className="w-96 bg-[#252b36] border-l border-white/5 overflow-auto h-full shadow-inner">
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Store className="size-5 text-slate-400" />
              Negocios
            </h3>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 border border-white/5 bg-[#2c3440] rounded-2xl p-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/10 rounded"></div>
                        <div className="h-3 bg-white/10 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MapPin className="size-12 mx-auto text-white/10 mb-2" />
                <p className="text-sm font-medium">No se encontraron comercios</p>
                <p className="text-xs text-slate-600">Intenta cambiar la búsqueda</p>
              </div>
            ) : (
              filteredBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className={`w-full text-left bg-[#2c3440] border rounded-2xl p-4 hover:shadow-md transition-all ${
                    selectedBusiness?.id === business.id
                      ? 'border-slate-500 shadow-md bg-white/5'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3 relative">
                    <div className="pr-12">
                      <h4 className="font-bold text-white text-[15px]">{business.nombre_negocio}</h4>
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <span className="size-1.5 rounded-full bg-slate-400"></span>
                        {getCategoriaName(business.categoria_id)}
                      </p>
                    </div>

                    <div className="absolute top-0 right-0 flex items-center gap-1 text-slate-400">
                      <Star className="size-3.5 fill-slate-500 text-slate-500" />
                      <span className="text-xs font-medium">
                        {business.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-3.5 shrink-0 mt-0.5" />
                        <span className="truncate leading-relaxed">{business.direccion}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="size-3.5 shrink-0 mt-0.5" />
                        <span>{business.horario}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {business.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-white/5 text-slate-300 rounded-md text-[10px] font-medium border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                      {business.tags?.length > 3 && (
                        <span className="px-2 py-0.5 bg-transparent text-slate-500 text-[10px] font-medium">
                          +{business.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Business Detail Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-[#1e2530]/80 flex items-end justify-center p-6 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#252b36] border border-white/10 rounded-3xl max-w-2xl w-full p-8 space-y-6 max-h-[85vh] overflow-auto shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {selectedBusiness.nombre_negocio}
                </h2>
                <p className="text-slate-400 font-medium mt-1">{getCategoriaName(selectedBusiness.categoria_id)}</p>
              </div>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 hover:bg-white/5 rounded-full size-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${
                    i < Math.floor(selectedBusiness.rating || 0)
                      ? 'fill-slate-500 text-slate-500'
                      : 'text-white/5'
                  }`}
                />
              ))}
              <span className="text-sm font-semibold ml-2 text-slate-300">
                {(selectedBusiness.rating || 0).toFixed(1)} de 5
              </span>
            </div>

            {selectedBusiness.descripcion && (
              <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                {selectedBusiness.descripcion}
              </p>
            )}

            <div className="space-y-4">
              <InfoRow
                icon={<MapPin className="size-5" />}
                label="Dirección"
                value={selectedBusiness.direccion}
              />
              <InfoRow
                icon={<Clock className="size-5" />}
                label="Horario de Atención"
                value={selectedBusiness.horario}
              />
              {selectedBusiness.telefono && (
                <InfoRow
                  icon={<Phone className="size-5" />}
                  label="Teléfono de Contacto"
                  value={selectedBusiness.telefono}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {selectedBusiness.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-xs font-medium border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBusiness.latitud},${selectedBusiness.longitud}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Navigation className="size-5" />
              Cómo Llegar (Google Maps)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function GooglePlacesFetcher({ onPlacesFound }) {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');

  useEffect(() => {
    if (!map || !placesLibrary) return;

    const service = new placesLibrary.PlacesService(map);

    const searchPlaces = () => {
      const request = {
        location: map.getCenter(),
        radius: 1000, // 1km radius
        type: ['store', 'restaurant', 'food', 'grocery_or_supermarket', 'liquor_store']
      };

      service.nearbySearch(request, (results, status) => {
        if (status === placesLibrary.PlacesServiceStatus.OK && results) {
          const formatted = results.map(place => {
            // Asignar una categoría genérica visual basada en los tags de Google
            let catId = 14; // Abarrotes por defecto
            if (place.types?.includes('restaurant') || place.types?.includes('food')) catId = 11; // Antojitos
            if (place.types?.includes('liquor_store') || place.types?.includes('bar')) catId = 12; // Mezcal/Bebidas

            return {
              id: `google-${place.place_id}`,
              nombre_negocio: place.name,
              categoria_id: catId,
              direccion: place.vicinity || 'Dirección en Google Maps',
              latitud: place.geometry.location.lat(),
              longitud: place.geometry.location.lng(),
              rating: place.rating || 0,
              horario: 'Sujeto a Google Maps',
              tags: place.types || [],
              isGooglePlace: true
            };
          });
          onPlacesFound(formatted);
        }
      });
    };

    // Buscar cuando el mapa se mueva
    const listener = map.addListener('idle', searchPlaces);
    
    // Búsqueda inicial
    searchPlaces();

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, placesLibrary, onPlacesFound]);

  return null;
}