import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Clock, Navigation, Star, Sparkles } from 'lucide-react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
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

  const filteredBusinesses = selectedCategory === 'Todos'
    ? businesses
    : businesses.filter(b =>
        getCategoriaName(b.categoria_id).toLowerCase().includes(selectedCategory.toLowerCase()) ||
        b.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
      );

  const handleMarkerClick = (business) => {
    setSelectedBusiness(business);
  };

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 z-10 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="size-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Descubre Durango</h1>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Cargando comercios...' : `${filteredBusinesses.length} negocios encontrados`}
              </p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.name
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
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
            <APIProvider apiKey={activeApiKey}>
              <Map
                defaultZoom={selectedBusiness ? 16 : 14}
                defaultCenter={selectedBusiness ? { lat: selectedBusiness.latitud, lng: selectedBusiness.longitud } : durangoCenter}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
              >
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
                    <div className="p-2 max-w-[200px] text-gray-900">
                      <h4 className="font-bold text-sm">{selectedBusiness.nombre_negocio}</h4>
                      <p className="text-xs text-gray-600">{getCategoriaName(selectedBusiness.categoria_id)}</p>
                      <p className="text-xs mt-1 text-purple-600 font-semibold">{selectedBusiness.horario}</p>
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
        <div className="w-96 bg-white border-l border-gray-200 overflow-auto h-full shadow-inner">
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Negocios Cercanos</h3>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 border border-gray-200 rounded-2xl p-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="size-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">No se encontraron comercios</p>
                <p className="text-xs text-gray-400">Intenta cambiar la categoría</p>
              </div>
            ) : (
              filteredBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className={`w-full text-left bg-white border-2 rounded-2xl p-4 hover:shadow-md transition-all ${
                    selectedBusiness?.id === business.id
                      ? 'border-purple-600 shadow-md bg-purple-50/10'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{business.nombre_negocio}</h4>
                      <p className="text-xs text-purple-600 font-semibold">{getCategoriaName(business.categoria_id)}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < Math.floor(business.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">
                        {business.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{business.direccion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-gray-400 shrink-0" />
                        <span>{business.horario}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {business.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
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
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center p-6 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 max-h-[85vh] overflow-auto shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedBusiness.nombre_negocio}
                </h2>
                <p className="text-purple-600 font-semibold mt-1">{getCategoriaName(selectedBusiness.categoria_id)}</p>
              </div>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 hover:bg-gray-100 rounded-full size-8 flex items-center justify-center transition-colors"
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
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm font-semibold ml-2 text-gray-700">
                {(selectedBusiness.rating || 0).toFixed(1)} de 5
              </span>
            </div>

            {selectedBusiness.descripcion && (
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
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
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBusiness.latitud},${selectedBusiness.longitud}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
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
      <div className="text-purple-600 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}