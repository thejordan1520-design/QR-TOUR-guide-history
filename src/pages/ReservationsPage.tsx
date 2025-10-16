import React, { useState, useEffect } from 'react';
import { ReservationForm } from '../components/ReservationForm';
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const ReservationsPage: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const excursionId = searchParams.get('excursion');

  const handleReservationSuccess = () => {
    setShowSuccess(true);
    // Ocultar mensaje de éxito después de 5 segundos
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reserva tu Excursión
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Completa el formulario a continuación para reservar tu excursión. 
              Nos pondremos en contacto contigo para confirmar los detalles.
            </p>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-green-800 font-medium">¡Reserva Confirmada!</h3>
                <p className="text-green-700 text-sm">
                  Hemos recibido tu solicitud de reserva. Te contactaremos pronto para confirmar los detalles.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de reserva */}
        <div className="bg-white rounded-lg shadow-sm">
          <ReservationForm 
            excursionId={excursionId || undefined} 
            onSuccess={handleReservationSuccess} 
          />
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Información Importante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Confirmación:</strong> Te contactaremos dentro de 24 horas para confirmar tu reserva.
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Flexibilidad:</strong> Podemos ajustar la fecha y hora según tu disponibilidad.
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Cancelación:</strong> Puedes cancelar hasta 24 horas antes sin costo.
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Grupos:</strong> Descuentos especiales disponibles para grupos de 6+ personas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
