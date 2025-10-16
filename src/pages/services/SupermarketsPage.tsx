import React, { useMemo, useState } from 'react';
import { useSupermarkets } from '../../hooks/useSupermarkets';
import { X, MapPin, Phone, Clock, Tag, ArrowLeft } from 'lucide-react';

interface Supermarket {
  id: string;
  name?: string;
  image_url?: string;
  address?: string;
  location?: string;
  phone?: string;
  schedule?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  order_position?: number;
}

const SupermarketsPage: React.FC = () => {
  const { supermarkets, loading, error, isRealtimeConnected } = useSupermarkets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Supermarket | null>(null);

  const buildMapsUrl = (s: Supermarket): string | undefined => {
    const name = (s.name || '').trim();
    const address = (s.address || s.location || '').trim();
    if (name) {
      const query = address ? `${name}, ${address}` : `${name}, Puerto Plata`;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    const hasCoords = s.latitude != null && s.longitude != null && s.latitude !== 0 && s.longitude !== 0;
    if (hasCoords) {
      const lat = Number(s.latitude);
      const lng = Number(s.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    }
    if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return undefined;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    console.log('🔍 SupermarketsPage: Filtrado con query:', { q, itemsCount: supermarkets.length });
    
    if (!q) {
      console.log('✅ SupermarketsPage: Sin query, devolviendo todos los items:', supermarkets.length);
      return supermarkets;
    }
    
    const filteredItems = supermarkets.filter(s => {
      const nameMatch = (s.name || '').toLowerCase().includes(q);
      const addressMatch = (s.address || s.location || '').toLowerCase().includes(q);
      const categoryMatch = (s.category || '').toLowerCase().includes(q);
      
      const matches = nameMatch || addressMatch || categoryMatch;
      console.log(`🔍 SupermarketsPage: ${s.name} - name:${nameMatch}, address:${addressMatch}, category:${categoryMatch} = ${matches}`);
      
      return matches;
    });
    
    console.log('📊 SupermarketsPage: Items filtrados:', filteredItems.length);
    return filteredItems;
  }, [supermarkets, query]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supermercados</h1>
        <p className="text-gray-600 mb-6">Listado en tiempo real desde Supabase.</p>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, dirección o categoría"
          className="w-full mb-6 px-4 py-2 border rounded-lg"
        />

        {loading ? (
          <div className="text-center text-gray-600">Cargando…</div>
        ) : (
          <>
            {console.log('🔄 SupermarketsPage: Renderizando con:', { 
              itemsCount: supermarkets.length, 
              filteredCount: filtered.length,
              loading,
              firstItem: supermarkets[0]?.name 
            })}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xl">No hay supermercados disponibles</p>
                <p className="text-gray-400 mt-2">Esta categoría aún no tiene supermercados registrados</p>
                <div className="mt-4 text-sm text-gray-400">
                  <p>Items en estado: {supermarkets.length}</p>
                  <p>Items filtrados: {filtered.length}</p>
                  <p>Query: "{query}"</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl border hover:shadow-lg transition p-4 cursor-pointer" onClick={() => setSelected(s)}>
                    <img src={s.image_url || '/places/placeholder.jpg'} alt={s.name} className="w-full h-40 object-cover rounded-lg mb-3" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
                    <div className="font-semibold text-gray-900">{s.name || 'Sin nombre'}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2"><Tag className="w-4 h-4" />{s.category || '—'}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1"><MapPin className="w-4 h-4" /> {s.address || s.location || '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {selected.image_url && (
                  <img src={selected.image_url} alt={selected.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}

                <div className="space-y-3">
                  {selected.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Descripción</h3>
                      <p className="text-gray-600">{selected.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selected.address || selected.location || 'Dirección no disponible'}</span>
                  </div>

                  {selected.phone && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{selected.phone}</span>
                    </div>
                  )}

                  {selected.schedule && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{selected.schedule}</span>
                    </div>
                  )}

                  {selected.category && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>{selected.category}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  {buildMapsUrl(selected) && (
                    <a
                      href={buildMapsUrl(selected)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center"
                    >
                      Ver en Google Maps
                    </a>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupermarketsPage;