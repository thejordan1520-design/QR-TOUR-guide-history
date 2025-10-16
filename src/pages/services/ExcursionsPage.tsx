import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useExcursions } from '../../hooks/useExcursions';
import { X, Star, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Excursion {
  id: string;
  title?: string;
  name?: string;
  image_url?: string;
  description?: string;
  price?: number;
  duration?: string | number;
  meeting_point?: string;
  max_participants?: number;
  difficulty_level?: string;
  category?: string;
  includes?: string[];
  requirements?: string[];
  order_position?: number;
  is_active?: boolean;
}

const ExcursionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { excursions, loading, error } = useExcursions();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Excursion | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return excursions;
    return excursions.filter(e =>
      (e.title || e.name || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q)
    );
  }, [excursions, query]);

  // Actualizar selected cuando cambien las traducciones
  useEffect(() => {
    if (selected && excursions.length > 0) {
      const updatedSelected = excursions.find(e => e.id === selected.id);
      if (updatedSelected) {
        setSelected(updatedSelected);
      }
    }
  }, [excursions, selected]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{t('navigation.back_to_services', 'Regresar a Servicios')}</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('pages.excursions.title', 'Excursiones')}</h1>
        <p className="text-gray-600 mb-6">{t('pages.excursions.subtitle', 'Agenda actividades con información real de Supabase.')}</p>

        <input 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder={t('forms.placeholders.search_excursion')} 
          className="w-full mb-6 px-4 py-2 border rounded-lg" 
        />

        {loading ? (
          <div className="text-center text-gray-600">{t('common.loading', 'Cargando…')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(e => (
              <div key={e.id} className="bg-white rounded-2xl border hover:shadow-lg transition p-4 cursor-pointer" onClick={() => setSelected(e)}>
                <img src={e.image_url || '/places/placeholder.jpg'} alt={e.title || e.name} className="w-full h-40 object-cover rounded-lg mb-3" onError={ev => { (ev.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
                <div className="font-semibold text-gray-900">{e.title || e.name || t('common.no_title', 'Sin título')}</div>
                <div className="text-sm text-gray-600 line-clamp-2 mb-2">{e.description || '—'}</div>
                {e.price && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-green-600">${e.price}</span>
                    <span className="text-sm text-gray-500">{t('common.per_person', 'por persona')}</span>
                  </div>
                )}
                {e.duration && (
                  <div className="text-xs text-gray-500">
                    {t('common.duration', 'Duración')}: {typeof e.duration === 'number' ? `${e.duration}h` : e.duration}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold text-lg">{selected.title || selected.name || t('common.excursion', 'Excursión')}</div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <img src={selected.image_url || '/places/placeholder.jpg'} alt={selected.title || selected.name} className="w-full h-56 object-cover" onError={e => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }} />
              <div className="p-4 space-y-3">
                <div className="text-gray-700">{selected.description || '—'}</div>
                
                {/* Información de precio y duración */}
                <div className="flex items-center justify-between">
                  {selected.price && (
                    <div className="text-2xl font-bold text-green-600">
                      ${selected.price}
                      <span className="text-sm font-normal text-gray-500 ml-1">{t('common.per_person', 'por persona')}</span>
                    </div>
                  )}
                  {selected.duration && (
                    <div className="text-sm text-gray-600">
                      {t('common.duration', 'Duración')}: {typeof selected.duration === 'number' ? `${selected.duration}h` : selected.duration}
                    </div>
                  )}
                </div>
                
                {/* Información adicional */}
                <div className="space-y-2">
                  {selected.meeting_point && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" /> 
                      <span>{selected.meeting_point}</span>
                    </div>
                  )}
                  
                  {selected.max_participants && (
                    <div className="text-sm text-gray-600">
                      {t('excursions.max_participants', 'Máximo')} {selected.max_participants} {t('excursions.participants', 'participantes')}
                    </div>
                  )}
                  
                  {selected.difficulty_level && (
                    <div className="text-sm text-gray-600">
                      {t('excursions.difficulty', 'Dificultad')}: {selected.difficulty_level}
                    </div>
                  )}
                </div>
                
                {/* Incluye */}
                {selected.includes && selected.includes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('excursions.includes', 'Incluye')}:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selected.includes.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Requisitos */}
                {selected.requirements && selected.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('excursions.requirements', 'Requisitos')}:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selected.requirements.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Link 
                  to={`/reservations?excursion=${selected.id}`}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  <Calendar className="w-5 h-5" /> {t('excursions.schedule', 'Agendar Excursión')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcursionsPage;