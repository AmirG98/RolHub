// Configuración de Clerk para el proyecto

export const clerkConfig = {
  // Rutas públicas que no requieren autenticación
  publicRoutes: [
    '/',
    '/login',
    '/register',
    '/api/health',
    '/dados',
    '/hoja-personaje',
    '/design-system',
    '/onboarding',
  ],

  // Rutas de autenticación
  signInUrl: '/login',
  signUpUrl: '/register',
  afterSignInUrl: '/campaigns',
  afterSignUpUrl: '/onboarding',

  // Apariencia personalizada medieval
  appearance: {
    variables: {
      colorPrimary: '#C9A84C', // gold
      colorBackground: '#0D0A05', // bg-main
      colorInputBackground: '#1A1208', // bg-panel
      colorInputText: '#F4E8C1', // parchment
      colorText: '#F4E8C1', // parchment
      colorTextSecondary: 'rgba(244, 232, 193, 0.8)',
      colorDanger: '#8B1A1A', // blood
      fontFamily: 'EB Garamond, serif',
      borderRadius: '0.5rem',
    },
    elements: {
      formButtonPrimary: {
        backgroundColor: '#C9A84C',
        color: '#0D0A05',
        '&:hover': {
          backgroundColor: '#F5C842',
        },
      },
      card: {
        backgroundColor: '#1A1208',
        border: '1px solid #8B6914',
        boxShadow: '0 0 0 3px #0D0A05, 0 0 0 4px #8B6914',
      },
      headerTitle: {
        fontFamily: 'Cinzel, serif',
        color: '#C9A84C',
      },
      headerSubtitle: {
        fontFamily: 'EB Garamond, serif',
        color: 'rgba(244, 232, 193, 0.8)',
      },
      socialButtonsBlockButton: {
        backgroundColor: '#2C2416',
        border: '1px solid #8B6914',
        color: '#F4E8C1',
        '&:hover': {
          backgroundColor: '#3A3020',
        },
      },
      formFieldInput: {
        backgroundColor: '#120C04',
        border: '1px solid #8B6914',
        color: '#F4E8C1',
        '&:focus': {
          borderColor: '#C9A84C',
          boxShadow: '0 0 0 2px rgba(201, 168, 76, 0.2)',
        },
      },
      footerActionLink: {
        color: '#C9A84C',
        '&:hover': {
          color: '#F5C842',
        },
      },
    },
  },
}
