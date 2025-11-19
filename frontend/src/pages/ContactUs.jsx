import { useState } from 'react';

export const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate form submission
      // In production, you would send this to a backend endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log the form data (in production, send to backend)
      console.log('Contact form submitted:', formData);

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Contacta con Nosotros</h1>
          <p className="text-xl opacity-90">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Teléfono</h3>
            <p className="text-gray-600 mb-2">(123) 456-7890</p>
            <p className="text-sm text-gray-500">Lunes a Viernes: 9:00 - 18:00</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 mb-2">info@salon.com</p>
            <p className="text-sm text-gray-500">Respuesta en 24 horas</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ubicación</h3>
            <p className="text-gray-600 mb-2">Calle Principal 123</p>
            <p className="text-sm text-gray-500">Ciudad, Estado 12345</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✓ ¡Mensaje enviado exitosamente!
                </p>
                <p className="text-sm text-green-700">
                  Nos pondremos en contacto pronto.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Asunto
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="general">Consulta General</option>
                  <option value="support">Soporte Técnico</option>
                  <option value="partnership">Asociación de Negocios</option>
                  <option value="feedback">Comentarios</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Cuéntanos qué necesitas..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div>
            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ¿Por qué contactarnos?
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-purple-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">Soporte 24/7</p>
                    <p className="text-sm text-gray-600">
                      Estamos disponibles para ayudarte
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Respuesta Rápida
                    </p>
                    <p className="text-sm text-gray-600">
                      Respondemos en menos de 24 horas
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">Equipo Experto</p>
                    <p className="text-sm text-gray-600">
                      Personal capacitado y amable
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Múltiples Canales
                    </p>
                    <p className="text-sm text-gray-600">
                      Contacta por teléfono, email o formulario
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h4 className="font-bold text-purple-900 mb-2">
                Horario de Atención
              </h4>
              <p className="text-sm text-purple-700 mb-2">
                <strong>Lunes a Viernes:</strong> 9:00 - 18:00
              </p>
              <p className="text-sm text-purple-700 mb-2">
                <strong>Sábado:</strong> 10:00 - 16:00
              </p>
              <p className="text-sm text-purple-700">
                <strong>Domingo:</strong> Cerrado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
