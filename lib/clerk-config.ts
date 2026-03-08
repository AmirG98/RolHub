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

  // Apariencia personalizada medieval con textos blancos
  appearance: {
    variables: {
      colorPrimary: '#C9A84C', // gold
      colorBackground: 'transparent', // transparente para ver estrellas
      colorInputBackground: 'rgba(26, 18, 8, 0.8)', // bg-panel semi-transparente
      colorInputText: '#FFFFFF', // blanco para inputs
      colorText: '#FFFFFF', // blanco para textos
      colorTextSecondary: 'rgba(255, 255, 255, 0.8)', // blanco semi-transparente
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
        backgroundColor: 'rgba(13, 10, 5, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #8B6914',
        boxShadow: '0 0 0 3px #0D0A05, 0 0 0 4px #8B6914',
      },
      headerTitle: {
        fontFamily: 'Cinzel, serif',
        color: '#C9A84C',
      },
      headerSubtitle: {
        fontFamily: 'EB Garamond, serif',
        color: '#FFFFFF',
      },
      socialButtonsBlockButton: {
        backgroundColor: 'rgba(44, 36, 22, 0.8)',
        border: '1px solid #8B6914',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: 'rgba(58, 48, 32, 0.9)',
        },
      },
      formFieldInput: {
        backgroundColor: 'rgba(18, 12, 4, 0.8)',
        border: '1px solid #8B6914',
        color: '#FFFFFF',
        '&:focus': {
          borderColor: '#C9A84C',
          boxShadow: '0 0 0 2px rgba(201, 168, 76, 0.2)',
        },
      },
      formFieldLabel: {
        color: '#FFFFFF',
      },
      identityPreviewText: {
        color: '#FFFFFF',
      },
      identityPreviewEditButton: {
        color: '#C9A84C',
      },
      formFieldInputPlaceholder: {
        color: 'rgba(255, 255, 255, 0.5)',
      },
      dividerText: {
        color: 'rgba(255, 255, 255, 0.6)',
      },
      dividerLine: {
        backgroundColor: 'rgba(139, 105, 20, 0.5)',
      },
      footerActionLink: {
        color: '#C9A84C',
        '&:hover': {
          color: '#F5C842',
        },
      },
      footerActionText: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      formHeaderTitle: {
        color: '#C9A84C',
      },
      formHeaderSubtitle: {
        color: '#FFFFFF',
      },
      otpCodeFieldInput: {
        color: '#FFFFFF',
        borderColor: '#8B6914',
      },
      alertText: {
        color: '#FFFFFF',
      },
    },
  },
}
