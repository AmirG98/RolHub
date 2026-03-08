# 🔐 Configuración de Clerk Authentication

Esta guía te llevará paso a paso para configurar la autenticación con Clerk en el proyecto.

## 📋 Paso 1: Crear Cuenta y Aplicación en Clerk

1. Ve a https://clerk.com
2. Crea una cuenta gratuita (o inicia sesión si ya tienes una)
3. Haz clic en "Add application" o "Create Application"
4. Nombre sugerido: `RPG Hub` o `RolHub`
5. Selecciona los métodos de autenticación que quieres habilitar:
   - ✅ **Email** (recomendado)
   - ✅ **Google** (opcional pero recomendado)
   - ✅ **GitHub** (opcional)
   - ⬜ Discord, Facebook, etc. (opcional)

## 🔑 Paso 2: Obtener las API Keys

1. Una vez creada la aplicación, ve a la sección **"API Keys"** en el sidebar
2. Verás dos keys importantes:
   - **Publishable Key** (comienza con `pk_test_...`)
   - **Secret Key** (comienza con `sk_test_...`)
3. Haz clic en "Copy" para copiar cada una

## ⚙️ Paso 3: Configurar Variables de Entorno

1. Abre tu archivo `.env.local` (si no existe, créalo en la raíz del proyecto)
2. Agrega las siguientes líneas reemplazando con tus keys reales:

```bash
# Auth - Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_KEY_AQUI
CLERK_SECRET_KEY=sk_test_TU_KEY_AQUI
```

**IMPORTANTE:**
- ⚠️ Nunca compartas el `CLERK_SECRET_KEY` públicamente
- ⚠️ Nunca lo subas a Git (el `.env.local` ya está en .gitignore)
- ⚠️ El `NEXT_PUBLIC_` prefix es necesario para la publishable key

## 🌐 Paso 4: Configurar URLs en Clerk Dashboard

Para que los redirects funcionen correctamente, configura estas URLs en Clerk:

1. Ve a **"Paths"** en el dashboard de Clerk
2. Configura:
   - **Sign-in page**: `/login`
   - **Sign-up page**: `/register`
   - **After sign-in**: `/campaigns`
   - **After sign-up**: `/onboarding`

3. Ve a **"Home URL"** y configura:
   - Development: `http://localhost:3000`
   - Production: `https://tu-dominio-vercel.app` (cuando hagas deploy)

## 🎨 Paso 5: Personalización (Opcional)

El proyecto ya está configurado con un tema medieval oscuro para Clerk. Si quieres ajustarlo:

1. Edita `/lib/clerk-config.ts`
2. Modifica los colores en `appearance.variables`
3. Los estilos ya están alineados con el diseño medieval del proyecto

## ✅ Paso 6: Verificar Instalación

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Ve a http://localhost:3000/login
3. Deberías ver el formulario de login estilizado con tema medieval
4. Intenta registrarte con tu email
5. Verifica que después del registro te redirija a `/onboarding`
6. Verifica que después del login te redirija a `/campaigns`

## 🔐 Cómo Funciona la Protección de Rutas

El middleware (`middleware.ts`) protege automáticamente todas las rutas excepto:

- `/` (Home pública)
- `/login` y `/register` (Auth pages)
- `/api/health` (Health check)
- `/dados`, `/hoja-personaje`, `/design-system` (Demos públicas)
- `/onboarding` (Primera vez después de registro)

Todas las demás rutas (`/campaigns`, `/characters`, `/compendium`, etc.) requieren autenticación.

## 🚀 Deploy a Vercel

Cuando hagas deploy a Vercel, no olvides agregar las variables de entorno:

1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a "Settings" → "Environment Variables"
4. Agrega las mismas keys que tienes en `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Marca "Production", "Preview", y "Development"
6. Haz un nuevo deploy

## 🆘 Troubleshooting

### Error: "Publishable key not valid"
- Verifica que copiaste la key completa (incluye el prefijo `pk_test_`)
- Verifica que no haya espacios al inicio o final
- Reinicia el servidor de desarrollo

### El login funciona pero no redirige correctamente
- Verifica que configuraste las URLs en el dashboard de Clerk
- Verifica que el middleware esté activo (debería estar en `middleware.ts`)

### "Clerk: No publishable key found"
- Verifica que la variable se llame exactamente `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Reinicia el servidor después de agregar las variables

### Los estilos no se ven bien
- El componente de Clerk carga sus estilos de forma asíncrona
- Espera 1-2 segundos después de cargar la página
- Verifica que la configuración en `/lib/clerk-config.ts` esté correcta

## 📚 Recursos

- [Documentación oficial de Clerk](https://clerk.com/docs)
- [Next.js App Router + Clerk](https://clerk.com/docs/quickstarts/nextjs)
- [Personalización de Clerk](https://clerk.com/docs/customization/overview)

---

¿Todo listo? Una vez configurado, deberías poder:
1. ✅ Registrarte con email o redes sociales
2. ✅ Iniciar sesión
3. ✅ Ver tu perfil en el navbar
4. ✅ Cerrar sesión
5. ✅ Acceder a rutas protegidas como `/campaigns`
