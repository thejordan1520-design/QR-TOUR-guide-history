import React, { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { servicesService } from '../../services/supabaseServices.js';
import { X, Phone, ArrowLeft, MapPin, Bus } from 'lucide-react';
import { useRealtimeOrderSync } from '../../services/realtimeOrderSync';
import { supabasePublic } from '../../lib/supabase';

interface Bus {
  id: string;
  name?: string;
  company?: string;
  route?: string;
  phone?: string;
  description?: string;
  image_url?: string;
  location?: string;
  more_info_url?: string;
  order_position?: number;
}

const BusesPage: React.FC = () => {
  const [items, setItems] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Bus | null>(null);

  // Sincronización en tiempo real para cambios de orden
  const { isConnected } = useRealtimeOrderSync(['buss'], (update) => {
    console.log('🔄 Actualización de orden recibida en buses (frontend):', update);
    fetchBuses(); // Refrescar buses cuando hay cambios de orden
  });

  const fetchBuses = async () => {
    setLoading(true);
    const { data, error } = await servicesService.getAllBusesUnpaginated();
    if (!error && Array.isArray(data) && data.length) {
      setItems(data);
    } else {
      try {
        // Fallback con ordenamiento por order_position
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('buss')
          .select('*')
          .order('order_position', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (!fallbackError && Array.isArray(fallbackData)) {
          setItems(fallbackData);
        } else {
          console.error('❌ BusesPage: Fallback fetch failed:', fallbackError);
        }
      } catch (err) {
        console.error('❌ BusesPage: Error in fallback fetch:', err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBuses();
  }, []); // Dependencia vacía para que se ejecute solo una vez al montar

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(b => 
      (b.name || b.company || '').toLowerCase().includes(q) ||
      (b.route || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q)
    );
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buses</h1>
        <p className="text-gray-600 mb-6">Rutas y servicios de transporte.</p>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre, ruta o empresa" className="w-full mb-6 px-4 py-2 border rounded-lg" />
        {loading ? (
          <div className="text-center text-gray-600">Cargando…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border hover:shadow-lg transition p-4 cursor-pointer" onClick={() => setSelected(b)}>
                <img src={b.image_url || '/places/placeholder.jpg'} alt={b.name || b.company} className="w-full h-40 object-cover rounded-lg mb-3" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
                <div className="font-semibold text-gray-900">{b.name || b.company || 'Empresa'}</div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Bus className="w-4 h-4" /> {b.route || 'Ruta no especificada'}
                </div>
                {b.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" /> 
                    {b.location.startsWith('http') ? (
                      <a 
                        href={b.location} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver ubicación
                      </a>
                    ) : (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location + ', Puerto Plata')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {b.location}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold text-xl">{selected.name || selected.company || 'Empresa'}</div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <img src={selected.image_url || '/places/placeholder.jpg'} alt={selected.name || selected.company} className="w-full h-64 object-cover" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
              <div className="p-5 space-y-4">
                {/* Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border">
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Ruta</div>
                    <div className="flex items-center gap-2 text-sm"><Bus className="w-4 h-4" /> {selected.route || 'No especificada'}</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Teléfono</div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> {selected.phone || 'No disponible'}</div>
                  </div>
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
                  {selected.more_info_url && (
                    <a
                      href={selected.more_info_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                    >
                      <MapPin className="w-4 h-4" /> Más información
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusesPage;


