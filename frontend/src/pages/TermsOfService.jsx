export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Términos de Servicio
        </h1>
        <p className="text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>

        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Aceptación de Términos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar Salon, usted acepta estar vinculado por estos
              términos de servicio. Si no está de acuerdo con alguna parte de estos
              términos, no utilice nuestro servicio. Nos reservamos el derecho de
              cambiar estos términos en cualquier momento, y su uso continuado del
              sitio significa que acepta los cambios.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Salon es una plataforma que conecta a clientes con estilistas
              profesionales. Nuestra plataforma proporciona herramientas para:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2">
              <li>Buscar y reservar servicios de belleza</li>
              <li>Gestionar citas y horarios</li>
              <li>Calificar y comentar sobre estilistas</li>
              <li>Comunicarse con profesionales del salón</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Cuentas de Usuario
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Cuando creas una cuenta con Salon, eres responsable de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Proporcionar información precisa y completa</li>
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Ser responsable de todas las actividades en tu cuenta</li>
              <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Conducta del Usuario
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Al usar Salon, aceptas no:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Usar la plataforma para actividades ilegales</li>
              <li>Acosar, amenazar o discriminar a otros usuarios</li>
              <li>Publicar contenido falso, ofensivo o difamatorio</li>
              <li>Intentar acceder sin autorización a sistemas o datos</li>
              <li>Interferir con el funcionamiento normal de la plataforma</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todo el contenido en Salon, incluyendo texto, gráficos, logos y
              software, es propiedad de Salon o de nuestros licenciantes. No puedes
              reproducir, distribuir o transmitir ningún contenido sin permiso
              previo. Las revisiones y calificaciones de usuarios permanecen siendo
              propiedad del usuario que las crea.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Salon proporciona la plataforma "tal como está" sin garantías de
              ningún tipo. No somos responsables por:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2">
              <li>Daños directos, indirectos o incidentales</li>
              <li>Pérdida de datos o beneficios</li>
              <li>Conducta de otros usuarios o estilistas</li>
              <li>Interrupciones del servicio</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Cancelaciones y Reembolsos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Los clientes pueden cancelar citas reservadas según nuestras políticas
              de cancelación. Los reembolsos se procesarán de acuerdo con los
              términos específicos de cada reserva. Salon se reserva el derecho de
              rechazar o cancelar citas que violen estos términos.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Privacidad
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Tu privacidad es importante para nosotros. Por favor, revisa nuestra
              Política de Privacidad para entender nuestras prácticas respecto a los
              datos que recopilamos y cómo los utilizamos.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Indemnización
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Aceptas indemnizar y mantener indemne a Salon, sus oficiales, directores
              y empleados de cualquier reclamo, responsabilidad o gasto que surja de tu
              uso de la plataforma o incumplimiento de estos términos.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Ley Aplicable
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Estos términos se rigen por las leyes del país/estado donde opera Salon.
              Cualquier disputa se resolverá en los tribunales competentes de esa
              jurisdicción.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre estos Términos de Servicio, contáctanos en:
            </p>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@salon.com
              </p>
              <p className="text-gray-700">
                <strong>Teléfono:</strong> (123) 456-7890
              </p>
              <p className="text-gray-700">
                <strong>Dirección:</strong> Calle Principal 123, Ciudad
              </p>
            </div>
          </section>

          {/* Footer Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <p className="text-sm text-blue-800">
              Estos términos constituyen el acuerdo completo entre tú y Salon
              respecto al uso de la plataforma y reemplazan todos los acuerdos
              previos. Si alguna disposición de estos términos es inválida, las
              disposiciones restantes permanecerán en vigencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
