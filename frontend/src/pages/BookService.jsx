import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceService, reservationService, profileService } from '../services/api';

export const BookService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [stylists, setStylists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  const [selectedStylist, setSelectedStylist] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [serviceId]);

  useEffect(() => {
    if (selectedStylist && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedStylist, selectedDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const serviceRes = await serviceService.getServiceById(serviceId);
      setService(serviceRes.data.service);

      const stylistsRes = await profileService.getAllStylists();
      setStylists(stylistsRes.data.profiles || []);

      setError(null);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const res = await reservationService.getAvailableSlots(
        selectedStylist,
        selectedDate
      );
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      console.error('Error al cargar horarios disponibles', err);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedStylist || !selectedDate || !selectedTime) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    setIsBooking(true);
    try {
      const reservationData = {
        stylist_id: selectedStylist,
        service_id: serviceId,
        scheduled_at: `${selectedDate}T${selectedTime}`,
        notes: notes,
      };

      await reservationService.createReservation(reservationData);
      alert('¡Reserva creada exitosamente!');
      navigate('/reservations');
    } catch (err) {
      alert('Error al crear reserva');
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate());
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from today
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">{error}</p>
          <button
            onClick={() => navigate('/services')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Volver a Servicios
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-xl font-semibold">Servicio no encontrado</p>
          <button
            onClick={() => navigate('/services')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Volver a Servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reservar Servicio</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {service.name}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="text-gray-700 text-sm mt-1">
                    {service.description}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {service.duration_minutes} minutos
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Precio</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${service.price}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Categoría</p>
                  <p className="text-gray-900">{service.category}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/services')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-purple-600 transition"
              >
                Volver
              </button>
            </div>
          </div>

          {/* Booking Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              <form onSubmit={handleBooking} className="space-y-6">
                {/* Stylist Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Selecciona una Estilista *
                  </label>
                  <select
                    value={selectedStylist}
                    onChange={(e) => {
                      setSelectedStylist(e.target.value);
                      setSelectedTime('');
                      setAvailableSlots([]);
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Elige una estilista --</option>
                    {stylists.map((stylist) => (
                      <option key={stylist.user_id} value={stylist.user_id}>
                        {stylist.user?.name}
                        {stylist.specialization && ` - ${stylist.specialization}`}
                        {stylist.experience_years && ` (${stylist.experience_years} años)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stylist Info Card */}
                {selectedStylist && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    {stylists
                      .filter((s) => s.user_id === parseInt(selectedStylist))
                      .map((stylist) => (
                        <div key={stylist.user_id}>
                          <p className="font-semibold text-gray-900">
                            {stylist.user?.name}
                          </p>
                          {stylist.specialization && (
                            <p className="text-sm text-gray-600">
                              Especialización: {stylist.specialization}
                            </p>
                          )}
                          {stylist.experience_years && (
                            <p className="text-sm text-gray-600">
                              Experiencia: {stylist.experience_years} años
                            </p>
                          )}
                          {stylist.rating && (
                            <p className="text-sm text-yellow-600">
                              Calificación: {stylist.rating} ⭐
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Selecciona una Fecha *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                      setAvailableSlots([]);
                    }}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes reservar hasta 30 días en adelante
                  </p>
                </div>

                {/* Time Selection */}
                {selectedDate && selectedStylist && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Selecciona una Hora *
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                              selectedTime === slot
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No hay horarios disponibles para esta fecha. Por favor,
                        selecciona otra.
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Comparte preferencias, alergias, o cualquier otra información importante..."
                  />
                </div>

                {/* Summary */}
                {selectedStylist && selectedDate && selectedTime && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Resumen de tu reserva:</strong>
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-600">Servicio:</span>{' '}
                        <span className="font-semibold">{service.name}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">Estilista:</span>{' '}
                        <span className="font-semibold">
                          {stylists
                            .filter((s) => s.user_id === parseInt(selectedStylist))
                            .map((s) => s.user?.name)}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Fecha y Hora:</span>{' '}
                        <span className="font-semibold">
                          {new Date(`${selectedDate}T${selectedTime}`).toLocaleString('es-ES')}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Duración:</span>{' '}
                        <span className="font-semibold">
                          {service.duration_minutes} minutos
                        </span>
                      </p>
                      <p className="text-lg font-bold text-purple-600 mt-2">
                        Total: ${service.price}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isBooking ||
                    !selectedStylist ||
                    !selectedDate ||
                    !selectedTime
                  }
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 font-semibold text-lg"
                >
                  {isBooking ? 'Procesando...' : 'Confirmar Reserva'}
                </button>

                <p className="text-xs text-center text-gray-600">
                  Al hacer clic en "Confirmar Reserva", aceptas nuestros términos y
                  condiciones
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
