export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Política de Privacidad
        </h1>
        <p className="text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>

        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-700 leading-relaxed">
              En Salon, estamos comprometidos con la protección de tu privacidad.
              Esta Política de Privacidad explica cómo recopilamos, utilizamos,
              compartimos y protegemos tu información cuando usas nuestra plataforma.
              Lee atentamente esta política para entender nuestras prácticas de
              privacidad.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Información que Recopilamos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Recopilamos varios tipos de información:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <strong>Información de Registro:</strong> Nombre, email, contraseña,
                teléfono
              </li>
              <li>
                <strong>Información de Perfil:</strong> Biografía, avatar, especialización,
                ubicación
              </li>
              <li>
                <strong>Información de Transacciones:</strong> Detalles de reservas,
                pagos, servicios
              </li>
              <li>
                <strong>Información de Comunicación:</strong> Mensajes, reseñas,
                calificaciones
              </li>
              <li>
                <strong>Información Técnica:</strong> Dirección IP, tipo de navegador,
                cookies
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Cómo Utilizamos tu Información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos la información que recopilamos para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar reservas y transacciones</li>
              <li>Enviar notificaciones importantes</li>
              <li>Personalizar tu experiencia</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Prevenir fraude y abuso</li>
              <li>Análisis y investigación para mejorar</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Cómo Compartimos tu Información
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos compartir tu información en las siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2">
              <li>
                <strong>Con Estilistas/Clientes:</strong> Información necesaria para
                procesar tu reserva
              </li>
              <li>
                <strong>Con Proveedores de Servicios:</strong> Empresas que nos ayudan
                a operar
              </li>
              <li>
                <strong>Por Requisito Legal:</strong> Si lo requiere la ley
              </li>
              <li>
                <strong>Con tu Consentimiento:</strong> Si nos autorizas explícitamente
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              No vendemos ni rentamos tu información personal a terceros.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Seguridad de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas técnicas y organizacionales para proteger tu
              información contra acceso no autorizado, alteración, divulgación o
              destrucción. Esto incluye encriptación SSL, firewalls y acceso restringido.
              Sin embargo, no podemos garantizar seguridad absoluta en internet.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Retención de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Retenemos tu información personal durante el tiempo necesario para
              proporcionar nuestros servicios. Puedes solicitar la eliminación de tu
              cuenta en cualquier momento, aunque podemos retener cierta información
              para cumplir requisitos legales.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia. Las cookies nos ayudan
              a:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2">
              <li>Mantener tu sesión iniciada</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el uso del sitio</li>
              <li>Mostrar contenido personalizado</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Puedes desactivar las cookies en tu navegador, pero esto puede afectar
              la funcionalidad del sitio.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Tus Derechos de Privacidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerme al procesamiento de mis datos</li>
              <li>Solicitar la portabilidad de mis datos</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Enlaces Externos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestro sitio puede contener enlaces a otros sitios web. No somos
              responsables por las prácticas de privacidad de sitios externos. Te
              recomendamos revisar las políticas de privacidad de cualquier sitio
              antes de proporcionar información personal.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Cambios a esta Política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad de vez en cuando. Te
              notificaremos de cambios significativos por email o mediante un aviso
              prominente en la plataforma. Tu uso continuado de Salon después de
              cambios significa que aceptas la política actualizada.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre esta Política de Privacidad o nuestras
              prácticas de privacidad, contáctanos en:
            </p>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@salon.com
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
            <p className="text-sm text-green-800">
              Nos esforzamos por mantener tus datos seguros y tu privacidad protegida.
              Si tienes preocupaciones sobre cómo tratamos tu información, no dudes
              en contactarnos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
