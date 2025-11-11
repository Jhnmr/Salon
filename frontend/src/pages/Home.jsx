/**
 * Home Page
 * Main dashboard page showing user appointments, services, and quick actions
 */

import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

export const Home = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // Fetch upcoming appointments
  const {
    data: appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useFetch('/appointments?status=pending,confirmed&limit=5');

  // Fetch available services
  const {
    data: services,
    loading: servicesLoading,
  } = useFetch('/services?limit=6');

  const getStatusColor = (status) => {
    const statusColors = {
      pending: theme.semantic.warning,
      confirmed: theme.semantic.info,
      completed: theme.semantic.success,
      cancelled: theme.semantic.error,
    };
    return statusColors[status] || theme.text.secondary;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ backgroundColor: theme.bg.primary, minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: theme.bg.secondary,
          borderBottom: `1px solid ${theme.border.primary}`,
          padding: theme.spacing.md,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.accent.primary,
              }}
            >
              SALON
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <Avatar
              src={user?.avatar_url}
              alt={user?.name}
              size="md"
            />
            <div>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.text.primary,
                }}
              >
                {user?.name}
              </p>
              <Badge variant="primary" size="sm">
                {user?.role}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: theme.spacing.xl }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.text.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Bienvenido, {user?.name?.split(' ')[0]}
          </h2>
          <p style={{ color: theme.text.secondary }}>
            Gestiona tus citas y servicios de belleza
          </p>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.xl,
          }}
        >
          <Card
            style={{
              padding: theme.spacing.lg,
              cursor: 'pointer',
              textAlign: 'center',
              transition: `all ${theme.transition.base}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize['3xl'],
                marginBottom: theme.spacing.sm,
              }}
            >
              📅
            </div>
            <h3
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.text.primary,
              }}
            >
              Nueva Cita
            </h3>
            <p style={{ color: theme.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Agenda un servicio
            </p>
          </Card>

          <Card
            style={{
              padding: theme.spacing.lg,
              cursor: 'pointer',
              textAlign: 'center',
              transition: `all ${theme.transition.base}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize['3xl'],
                marginBottom: theme.spacing.sm,
              }}
            >
              💇
            </div>
            <h3
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.text.primary,
              }}
            >
              Servicios
            </h3>
            <p style={{ color: theme.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Explora servicios
            </p>
          </Card>

          <Card
            style={{
              padding: theme.spacing.lg,
              cursor: 'pointer',
              textAlign: 'center',
              transition: `all ${theme.transition.base}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize['3xl'],
                marginBottom: theme.spacing.sm,
              }}
            >
              👤
            </div>
            <h3
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.text.primary,
              }}
            >
              Mi Perfil
            </h3>
            <p style={{ color: theme.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Configuración
            </p>
          </Card>
        </div>

        {/* Appointments Section */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <h2
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.text.primary,
              }}
            >
              Próximas Citas
            </h2>
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </div>

          {appointmentsLoading ? (
            <Card style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
              <p style={{ color: theme.text.secondary }}>Cargando citas...</p>
            </Card>
          ) : appointmentsError ? (
            <Card style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
              <p style={{ color: theme.semantic.error }}>{appointmentsError}</p>
            </Card>
          ) : !appointments || appointments.length === 0 ? (
            <Card style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
              <p style={{ color: theme.text.secondary }}>
                No tienes citas programadas
              </p>
              <Button variant="primary" style={{ marginTop: theme.spacing.md }}>
                Agendar Ahora
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {appointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  style={{
                    padding: theme.spacing.lg,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.text.primary,
                        }}
                      >
                        {appointment.service?.name || 'Servicio'}
                      </h3>
                      <Badge
                        style={{
                          backgroundColor: getStatusColor(appointment.status) + '20',
                          color: getStatusColor(appointment.status),
                        }}
                        size="sm"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <p
                      style={{
                        color: theme.text.secondary,
                        fontSize: theme.typography.fontSize.sm,
                      }}
                    >
                      {formatDate(appointment.scheduled_at)}
                    </p>
                    {appointment.professional && (
                      <p
                        style={{
                          color: theme.text.secondary,
                          fontSize: theme.typography.fontSize.sm,
                        }}
                      >
                        Con: {appointment.professional.name}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    {appointment.status === 'pending' && (
                      <Button variant="primary" size="sm">
                        Confirmar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Services Section */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <h2
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.text.primary,
              }}
            >
              Servicios Populares
            </h2>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: theme.spacing.md,
            }}
          >
            {servicesLoading ? (
              <Card style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
                <p style={{ color: theme.text.secondary }}>Cargando servicios...</p>
              </Card>
            ) : services && services.length > 0 ? (
              services.map((service) => (
                <Card
                  key={service.id}
                  style={{
                    padding: theme.spacing.lg,
                    cursor: 'pointer',
                    transition: `all ${theme.transition.base}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.text.primary,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    {service.name}
                  </h3>
                  <p
                    style={{
                      color: theme.text.secondary,
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    {service.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.xl,
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.accent.primary,
                      }}
                    >
                      ${service.price}
                    </span>
                    <span style={{ color: theme.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                      {service.duration} min
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <Card style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
                <p style={{ color: theme.text.secondary }}>
                  No hay servicios disponibles
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
