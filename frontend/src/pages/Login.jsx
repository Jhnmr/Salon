/**
 * Login Page
 * User authentication page with login and registration forms
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const validateLogin = (values) => {
  const errors = {};

  if (!values.email) {
    errors.email = 'El email es requerido';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Email inválido';
  }

  if (!values.password) {
    errors.password = 'La contraseña es requerida';
  } else if (values.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
};

const validateRegister = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'El nombre es requerido';
  }

  if (!values.email) {
    errors.email = 'El email es requerido';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Email inválido';
  }

  if (!values.phone) {
    errors.phone = 'El teléfono es requerido';
  }

  if (!values.password) {
    errors.password = 'La contraseña es requerida';
  } else if (values.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!values.password_confirmation) {
    errors.password_confirmation = 'Confirma tu contraseña';
  } else if (values.password !== values.password_confirmation) {
    errors.password_confirmation = 'Las contraseñas no coinciden';
  }

  return errors;
};

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error: authError } = useAuth();
  const { theme } = useTheme();

  const handleLoginSubmit = async (values) => {
    await login(values.email, values.password);
  };

  const handleRegisterSubmit = async (values) => {
    await register(values);
  };

  const loginForm = useForm(
    { email: '', password: '' },
    handleLoginSubmit,
    validateLogin
  );

  const registerForm = useForm(
    {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      role: 'client',
    },
    handleRegisterSubmit,
    validateRegister
  );

  const currentForm = isLogin ? loginForm : registerForm;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: theme.spacing.md,
        backgroundColor: theme.bg.primary,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: theme.spacing.xl,
        }}
      >
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
          <h1
            style={{
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.accent.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            SALON
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.text.secondary,
            }}
          >
            {isLogin ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div
            style={{
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              backgroundColor: theme.semantic.error + '20',
              border: `1px solid ${theme.semantic.error}`,
              borderRadius: theme.radius.md,
              color: theme.semantic.error,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            {authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={currentForm.handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: theme.spacing.md }}>
              <Input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={registerForm.values.name}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                error={
                  registerForm.touched.name && registerForm.errors.name
                }
              />
            </div>
          )}

          <div style={{ marginBottom: theme.spacing.md }}>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={currentForm.values.email}
              onChange={currentForm.handleChange}
              onBlur={currentForm.handleBlur}
              error={
                currentForm.touched.email && currentForm.errors.email
              }
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: theme.spacing.md }}>
              <Input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={registerForm.values.phone}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                error={
                  registerForm.touched.phone && registerForm.errors.phone
                }
              />
            </div>
          )}

          <div style={{ marginBottom: theme.spacing.md }}>
            <Input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={currentForm.values.password}
              onChange={currentForm.handleChange}
              onBlur={currentForm.handleBlur}
              error={
                currentForm.touched.password && currentForm.errors.password
              }
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: theme.spacing.md }}>
              <Input
                type="password"
                name="password_confirmation"
                placeholder="Confirmar contraseña"
                value={registerForm.values.password_confirmation}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                error={
                  registerForm.touched.password_confirmation &&
                  registerForm.errors.password_confirmation
                }
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={currentForm.isSubmitting}
            style={{ marginBottom: theme.spacing.md }}
          >
            {currentForm.isSubmitting
              ? 'Cargando...'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Registrarse'}
          </Button>

          {isLogin && (
            <div style={{ textAlign: 'center', marginBottom: theme.spacing.md }}>
              <a
                href="#"
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.accent.primary,
                  textDecoration: 'none',
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}

          <div
            style={{
              textAlign: 'center',
              paddingTop: theme.spacing.md,
              borderTop: `1px solid ${theme.border.primary}`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                currentForm.resetForm();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                cursor: 'pointer',
              }}
            >
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <span style={{ color: theme.accent.primary, fontWeight: 500 }}>
                {isLogin ? 'Regístrate' : 'Inicia Sesión'}
              </span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
