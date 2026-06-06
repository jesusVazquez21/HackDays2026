import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function Explorar() {
  // Las coordenadas de tu primer comercio de prueba
  const centroMapa = { lat: 24.0277, lng: -104.6532 };

  return (
    // Es CRUCIAL que el contenedor padre tenga una altura definida, 
    // de lo contrario el mapa colapsará y no se verá nada.
    <div style={{ height: '100vh', width: '100%' }}>
      
      {/* APIProvider maneja la carga del script de Google Maps usando tu llave */}
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        
        <Map 
          defaultZoom={15} 
          defaultCenter={centroMapa}
          gestureHandling={'greedy'} // Permite moverse libremente por el mapa
          disableDefaultUI={false}   // Muestra los controles por defecto (zoom, street view)
        >
          {/* Aquí puedes colocar un marcador de prueba */}
          <Marker position={centroMapa} />
          
          {/* En el futuro, aquí importarás a Supabase, harás un .map() de tus 'comercios' 
            y renderizarás un <Marker /> por cada coordenada que tengas en tu tabla.
          */}
        </Map>
        
      </APIProvider>
      
    </div>
  );
}