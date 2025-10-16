import React, { useEffect, useMemo, useState } from 'react';
import { useRestaurants } from '../../hooks/useRestaurants';
import { X, Star, MapPin, Phone, Clock, DollarSign, Utensils, ArrowLeft } from 'lucide-react';

interface Restaurant {
  id: string;
  name?: string;
  image_url?: string;
  cuisine_type?: string; // Corregido: era 'cuisine'
  address?: string;
  location?: string;
  phone?: string;
  rating?: number;
  description?: string;
  opening_hours?: string; // Corregido: era 'schedule'
  price_range?: string;
  latitude?: number;
  longitude?: number;
  order_position?: number;
}

const RestaurantsPage: React.FC = () => {
  const { restaurants, loading, error, isRealtimeConnected } = useRestaurants();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const buildMapsUrl = (r: Restaurant): string | undefined => {
    // Prefer search by NAME (+ optional address) as solicitado
    const name = (r.name || '').trim();
    const address = (r.address || r.location || '').trim();
    if (name) {
      const query = address ? `${name}, ${address}` : `${name}, Puerto Plata`;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    // Fallback: coordenadas
    const hasCoords = r.latitude != null && r.longitude != null && r.latitude !== 0 && r.longitude !== 0;
    if (hasCoords) {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    }
    // Fallback: sólo dirección
    if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return undefined;
  };

  // Eliminar el useEffect ya que useRestaurants maneja la carga de datos

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    console.log('🔍 RestaurantsPage: Filtrado con query:', { q, itemsCount: restaurants.length });
    
    if (!q) {
      console.log('✅ RestaurantsPage: Sin query, devolviendo todos los items:', restaurants.length);
      return restaurants;
    }
    
    const filteredItems = restaurants.filter(r => {
      const nameMatch = (r.name || '').toLowerCase().includes(q);
      const cuisineMatch = (r.cuisine_type || '').toLowerCase().includes(q);
      const addressMatch = (r.address || r.location || '').toLowerCase().includes(q);
      
      const matches = nameMatch || cuisineMatch || addressMatch;
      console.log(`🔍 RestaurantsPage: ${r.name} - name:${nameMatch}, cuisine:${cuisineMatch}, address:${addressMatch} = ${matches}`);
      
      return matches;
    });
    
    console.log('📊 RestaurantsPage: Items filtrados:', filteredItems.length);
    return filteredItems;
  }, [restaurants, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Regresar a Servicios</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurantes cerca</h1>
        <p className="text-gray-600 mb-6">Listado en tiempo real desde Supabase.</p>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, tipo o dirección"
          className="w-full mb-6 px-4 py-2 border rounded-lg"
        />

        {loading ? (
          <div className="text-center text-gray-600">Cargando…</div>
        ) : (
          <>
            {console.log('🔄 RestaurantsPage: Renderizando con:', { 
              itemsCount: restaurants.length, 
              filteredCount: filtered.length,
              loading,
              firstItem: restaurants[0]?.name 
            })}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xl">No hay restaurantes disponibles</p>
                <p className="text-gray-400 mt-2">Esta categoría aún no tiene restaurantes registrados</p>
                <div className="mt-4 text-sm text-gray-400">
                  <p>Items en estado: {restaurants.length}</p>
                  <p>Items filtrados: {filtered.length}</p>
                  <p>Query: "{query}"</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border hover:shadow-lg transition p-4 cursor-pointer" onClick={() => setSelected(r)}>
                    <img src={r.image_url || '/places/placeholder.jpg'} alt={r.name} className="w-full h-40 object-cover rounded-lg mb-3" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
                    <div className="font-semibold text-gray-900">{r.name || 'Sin nombre'}</div>
                    <div className="text-sm text-gray-600">{r.cuisine_type || '—'}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" /> {r.address || r.location || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold text-xl">{selected.name || 'Restaurante'}</div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <img src={selected.image_url || '/places/placeholder.jpg'} alt={selected.name} className="w-full h-64 object-cover" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
              <div className="p-5 space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2 text-gray-900">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{Number(selected.rating ?? 0).toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">(0 reseñas)</span>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border">
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Ubicación</div>
                    <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4" /> {selected.address || selected.location || '—'}</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Teléfono</div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> {selected.phone || 'No disponible'}</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Horarios</div>
                    <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /> {selected.opening_hours || '—'}</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Rango de Precio</div>
                    <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4" /> {selected.price_range || '—'}</div>
                  </div>
                </div>

                {/* Tipo de cocina */}
                <div className="bg-white rounded-xl border p-4">
                  <div className="font-semibold text-gray-900 mb-1">Tipo de Cocina</div>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-1">
                    <Utensils className="w-4 h-4" /> {selected.cuisine || '—'}
                  </div>
                </div>

                {/* Descripción */}
                {selected.description && (
                  <div className="text-gray-700">{selected.description}</div>
                )}

                {/* Acciones */}
                <div className="flex gap-3 pt-1">
                  <a
                    href={selected.phone ? `tel:${selected.phone}` : undefined}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${selected.phone ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    aria-disabled={!selected.phone}
                  >
                    <Phone className="w-4 h-4" /> Llamar
                  </a>
                  {(() => {
                    const mapsUrl = buildMapsUrl(selected);
                    const handleOpen = (e: React.MouseEvent) => {
                      e.preventDefault();
                      if (mapsUrl) window.open(mapsUrl, '_blank', 'noopener');
                    };
                    return (
                      <a
                        href={mapsUrl || '#'}
                        onClick={handleOpen}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${mapsUrl ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        aria-disabled={!mapsUrl}
                      >
                        <MapPin className="w-4 h-4" /> Ver en mapa
                      </a>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;


