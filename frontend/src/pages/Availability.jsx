import { useEffect, useState } from 'react';
import { availabilityService } from '../services/api';

export const Availability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    monday_start: '09:00',
    monday_end: '18:00',
    tuesday_start: '09:00',
    tuesday_end: '18:00',
    wednesday_start: '09:00',
    wednesday_end: '18:00',
    thursday_start: '09:00',
    thursday_end: '18:00',
    friday_start: '09:00',
    friday_end: '18:00',
    saturday_start: '10:00',
    saturday_end: '16:00',
    sunday_available: false,
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes', dayOfWeek: 1 },
    { key: 'tuesday', label: 'Martes', dayOfWeek: 2 },
    { key: 'wednesday', label: 'Miércoles', dayOfWeek: 3 },
    { key: 'thursday', label: 'Jueves', dayOfWeek: 4 },
    { key: 'friday', label: 'Viernes', dayOfWeek: 5 },
    { key: 'saturday', label: 'Sábado', dayOfWeek: 6 },
    { key: 'sunday', label: 'Domingo', dayOfWeek: 0 },
  ];

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const res = await availabilityService.getMyAvailability();
      const availByDay = res.data.availabilities || [];

      // Build form data from availabilities
      const newFormData = { ...formData };
      daysOfWeek.forEach((day) => {
        const avail = availByDay.find((a) => a.day_of_week === day.dayOfWeek);
        if (avail && avail.is_available) {
          newFormData[`${day.key}_start`] = avail.start_time;
          newFormData[`${day.key}_end`] = avail.end_time;
        }
        if (day.key === 'sunday' && avail && avail.is_available) {
          newFormData.sunday_available = true;
        }
      });

      setFormData(newFormData);
      setAvailabilities(availByDay);
      setError(null);
    } catch (err) {
      setError('Error al cargar disponibilidad');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const availabilityData = [];

      // Process each day
      daysOfWeek.forEach((day) => {
        if (day.key === 'sunday') {
          if (formData.sunday_available) {
            availabilityData.push({
              day_of_week: day.dayOfWeek,
              start_time: '09:00',
              end_time: '18:00',
              is_available: true,
            });
          }
        } else {
          availabilityData.push({
            day_of_week: day.dayOfWeek,
            start_time: formData[`${day.key}_start`],
            end_time: formData[`${day.key}_end`],
            is_available: true,
          });
        }
      });

      await availabilityService.bulkSetAvailability(availabilityData);
      alert('Horarios actualizados exitosamente');
      fetchAvailabilities();
    } catch (err) {
      alert('Error al actualizar horarios');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Disponibilidad</h1>
          <p className="text-gray-600">
            Configura los horarios en que estás disponible para atender clientes
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Day Inputs */}
            {daysOfWeek.map((day, index) => {
              const isLastDay = index === daysOfWeek.length - 1;
              return (
                <div key={day.key} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {day.label}
                    </h3>
                    {day.key === 'sunday' && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="sunday_available"
                          checked={formData.sunday_available}
                          onChange={handleChange}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-600">
                          Trabajar este día
                        </span>
                      </label>
                    )}
                  </div>

                  {day.key !== 'sunday' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Hora de inicio
                        </label>
                        <input
                          type="time"
                          name={`${day.key}_start`}
                          value={formData[`${day.key}_start`]}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Hora de cierre
                        </label>
                        <input
                          type="time"
                          name={`${day.key}_end`}
                          value={formData[`${day.key}_end`]}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  {day.key === 'sunday' && formData.sunday_available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Hora de inicio (09:00 - Estándar)
                        </label>
                        <input
                          type="time"
                          value="09:00"
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Hora de cierre (18:00 - Estándar)
                        </label>
                        <input
                          type="time"
                          value="18:00"
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los clientes podrán reservar citas en los horarios que
                establecer aquí. Las citas se generan en espacios de 30 minutos. Asegúrate
                de que tus horarios sean suficientes para atender a tus clientes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
              >
                {isSaving ? 'Guardando...' : 'Guardar Horarios'}
              </button>
              <button
                type="button"
                onClick={fetchAvailabilities}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Recargar
              </button>
            </div>
          </form>
        </div>

        {/* Weekly Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Resumen de Disponibilidad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {availabilities.length > 0 ? (
              availabilities.map((avail) => {
                const day = daysOfWeek.find((d) => d.dayOfWeek === avail.day_of_week);
                return (
                  <div
                    key={avail.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <p className="font-semibold text-gray-900 mb-2">
                      {day?.label}
                    </p>
                    {avail.is_available ? (
                      <>
                        <p className="text-sm text-gray-600">
                          Inicio: <span className="font-semibold">{avail.start_time}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Cierre: <span className="font-semibold">{avail.end_time}</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-red-600 font-semibold">No disponible</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-gray-600">
                No hay horarios configurados. Configúralos y guarda para verlos aquí.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
