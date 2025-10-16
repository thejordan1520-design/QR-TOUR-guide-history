import React, { useMemo, useState } from 'react';
import { X, Calendar, MapPin, ArrowLeft, ExternalLink, Clock, Info, Link as LinkIcon } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';

interface EventItem {
  id: string;
  title: string;
  image_url?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  more_info_url?: string;
  order_position?: number;
}

const EventsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<EventItem | null>(null);
  const { events: items, loading, error } = useEvents();
  console.log('📅 EventsPage: Events:', items.length, 'Loading:', loading, 'Error:', error);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(e => (e.title || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
  }, [items, query]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos</h1>
        <p className="text-gray-600 mb-6">Agenda cultural y actividades.</p>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar evento" className="w-full mb-6 px-4 py-2 border rounded-lg" />

        {loading ? (
          <div className="text-center text-gray-600">Cargando…</div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p>Error al cargar eventos: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(e => (
              <div 
                key={e.id} 
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 p-0 cursor-pointer overflow-hidden group transform hover:-translate-y-1" 
                onClick={() => setSelected(e)}
              >
                {/* Imagen de portada */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={e.image_url || '/places/placeholder.jpg'} 
                    alt={e.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    onError={ev => { 
                      (ev.target as HTMLImageElement).src = '/places/placeholder.jpg'; 
                    }} 
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Evento
                    </div>
                  </div>
                  {/* Gradiente inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                
                {/* Contenido de la tarjeta */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {e.title}
                  </h3>
                  
                  {/* Descripción breve */}
                  {e.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {e.description}
                    </p>
                  )}
                  
                  {/* Metadatos */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">
                        {e.start_date ? new Date(e.start_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Próximamente'}
                      </span>
                    </div>
                    
                    {e.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="line-clamp-1">{e.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Botón de leer más */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-purple-600 font-medium text-sm group-hover:text-purple-700 transition-colors inline-flex items-center gap-1">
                      Leer más
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Header con imagen de portada */}
              <div className="relative h-80 bg-gradient-to-br from-purple-600 to-indigo-600">
                {selected.image_url ? (
                  <img 
                    src={selected.image_url} 
                    alt={selected.title} 
                    className="w-full h-full object-cover"
                    onError={ev => { 
                      (ev.target as HTMLImageElement).src = '/places/placeholder.jpg'; 
                    }} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-24 h-24 text-white/30" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setSelected(null)} 
                    className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full p-2 hover:bg-white transition-all shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Overlay con gradiente */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>

              {/* Contenido del artículo con scroll */}
              <div className="overflow-y-auto max-h-[calc(90vh-20rem)] p-8">
                {/* Título estilo artículo */}
                <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {selected.title}
                </h2>

                {/* Metadata del evento */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                  {selected.start_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Fecha de Inicio</p>
                        <p className="text-sm font-semibold">
                          {new Date(selected.start_date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(selected.start_date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {selected.end_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Fecha de Fin</p>
                        <p className="text-sm font-semibold">
                          {new Date(selected.end_date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {selected.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Ubicación</p>
                        <p className="text-sm font-semibold">{selected.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contenido del artículo */}
                <article className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selected.description || (
                      <p className="text-gray-400 italic">No hay descripción disponible para este evento.</p>
                    )}
                  </div>
                </article>

                {/* Enlaces adicionales */}
                {selected.more_info_url && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-purple-600" />
                      Información Adicional
                    </h3>
                    <a
                      href={selected.more_info_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="font-medium">Ver más información</span>
                    </a>
                  </div>
                )}

                {/* Ubicación en mapa (si existe) */}
                {selected.location && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Cómo Llegar
                    </h3>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Ver en Google Maps</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selected.start_date && (
                      <span>Publicado el {new Date(selected.start_date).toLocaleDateString('es-ES')}</span>
                    )}
                  </p>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
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

export default EventsPage;


