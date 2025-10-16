import React, { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { servicesService } from '../../services/supabaseServices.js';
import { X, Phone, ArrowLeft, MapPin } from 'lucide-react';
import { useRealtimeOrderSync } from '../../services/realtimeOrderSync';
import { supabasePublic } from '../../lib/supabase';

interface Guide {
  id: string;
  name?: string;
  phone?: string;
  description?: string;
  languages?: string;
  location?: string;
  image_url?: string;
  hourly_rate?: number;
  order_position?: number;
}

const TourGuidesPage: React.FC = () => {
  const [items, setItems] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Guide | null>(null);

  // Sincronización en tiempo real para cambios de orden
  const { isConnected } = useRealtimeOrderSync(['tourist_guides'], (update) => {
    console.log('🔄 Actualización de orden recibida en guías turísticos (frontend):', update);
    fetchGuides(); // Refrescar guías cuando hay cambios de orden
  });

  const fetchGuides = async () => {
    setLoading(true);
    const { data, error } = await servicesService.getAllTourGuidesUnpaginated();
    if (!error && Array.isArray(data) && data.length) {
      setItems(data);
    } else {
      try {
        // Fallback con ordenamiento por order_position
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('tourist_guides')
          .select('*')
          .order('order_position', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (!fallbackError && Array.isArray(fallbackData)) {
          setItems(fallbackData);
        } else {
          console.error('❌ TourGuidesPage: Fallback fetch failed:', fallbackError);
        }
      } catch (err) {
        console.error('❌ TourGuidesPage: Error in fallback fetch:', err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGuides();
  }, []); // Dependencia vacía para que se ejecute solo una vez al montar

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(g => (g.name || '').toLowerCase().includes(q) || (g.languages || '').toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Regresar a Servicios</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Guías Turísticos</h1>
        <p className="text-gray-600 mb-6">Contacta guías certificados.</p>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o idiomas" className="w-full mb-6 px-4 py-2 border rounded-lg" />
        {loading ? (
          <div className="text-center text-gray-600">Cargando…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(g => (
              <div key={g.id} className="bg-white rounded-2xl border hover:shadow-lg transition p-4 cursor-pointer" onClick={() => setSelected(g)}>
                <img src={g.image_url || '/places/placeholder.jpg'} alt={g.name || 'Guía'} className="w-full h-40 object-cover rounded-lg mb-3" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
                <div className="font-semibold text-gray-900">{g.name || 'Guía'}</div>
                <div className="text-sm text-gray-600">Idiomas: {g.languages || '—'}</div>
                {g.hourly_rate && (
                  <div className="text-sm text-green-600 font-semibold">${g.hourly_rate}/hora</div>
                )}
                {g.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" /> 
                    {g.location.startsWith('http') ? (
                      <a 
                        href={g.location} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver ubicación
                      </a>
                    ) : (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.location + ', Puerto Plata')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {g.location}
                      </a>
                    )}
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">{g.description || ''}</div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold text-xl">{selected.name || 'Guía'}</div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <img src={selected.image_url || '/places/placeholder.jpg'} alt={selected.name || 'Guía'} className="w-full h-64 object-cover" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
              <div className="p-5 space-y-4">
                {/* Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border">
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Idiomas</div>
                    <div className="text-sm">{selected.languages || 'No especificado'}</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Teléfono</div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> {selected.phone || 'No disponible'}</div>
                  </div>
                  {selected.hourly_rate && (
                    <div className="text-gray-700">
                      <div className="font-semibold text-gray-900 mb-1">Tarifa por Hora</div>
                      <div className="text-sm text-green-600 font-semibold">${selected.hourly_rate}</div>
                    </div>
                  )}
                  {selected.location && (
                    <div className="text-gray-700">
                      <div className="font-semibold text-gray-900 mb-1">Ubicación</div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" /> 
                        {selected.location.startsWith('http') ? (
                          <a 
                            href={selected.location} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {selected.location}
                          </a>
                        ) : (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.location + ', Puerto Plata')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {selected.location}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                {selected.description && (
                  <div className="bg-white rounded-xl border p-4">
                    <div className="font-semibold text-gray-900 mb-2">Descripción</div>
                    <div className="text-gray-700">{selected.description}</div>
                  </div>
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourGuidesPage;


