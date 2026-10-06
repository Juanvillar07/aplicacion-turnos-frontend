# AgendaBarrio · Frontend

Panel de los negocios, página pública de reservas y asistente "Crear tu negocio" de AgendaBarrio, un SaaS de agendamiento para microempresas locales.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · Zustand · React Router · Axios · lucide-react · date-fns.

| Repositorio | Contenido |
|-------------|-----------|
| [aplicacion-turnos-frontend](https://github.com/Juanvillar07/aplicacion-turnos-frontend) | Este |
| [aplicacion-turnos-backend](https://github.com/Juanvillar07/aplicacion-turnos-backend) | API, base de datos, correos y WhatsApp. Su README documenta los endpoints y las reglas de negocio |

## Puesta en marcha

Requisitos: Node.js 22+ y el backend corriendo (por defecto en http://localhost:3000).

```bash
cp .env.example .env        # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev                 # http://localhost:5173
```

Otros comandos: `npm run build` (compila a `dist/`) y `npm run lint` (oxlint).

## Rutas principales

| Ruta | Quién | Qué es |
|------|-------|--------|
| `/crear-negocio` | público | Asistente: plan → cuenta. El pago y los datos del negocio siguen en `/onboarding` |
| `/login`, `/forgot-password`, `/reset-password` | público | Acceso a la cuenta |
| `/invitations/:token` | público | Aceptar una invitación al equipo |
| `/onboarding` | con sesión | Elegir plan, pagar (simulado) y crear el negocio; retoma el paso pendiente |
| `/app/...` | miembros | Panel: resumen, agenda, clientes, servicios, profesionales, miembros, configuración y cuenta |
| `/admin/...` | superadministrador | Métricas de la plataforma y gestión de negocios |
| `/b/:slug` | clientes finales | Página pública de reservas del negocio |
| `/cita/:token` | clientes finales | Ver, reprogramar o cancelar una cita |

`/register` redirige a `/crear-negocio`: no hay registro libre.

## Detalles del asistente "Crear tu negocio"

- **Pasos:** Plan → Cuenta → Pago → Negocio. Cada paso tiene "Atrás", y el botón atrás del navegador funciona igual porque el paso va en la URL (`?plan=`, `?paso=`).
- **Contraseñas:** se escriben dos veces y deben tener mínimo 8 caracteres, una mayúscula y un carácter especial. `components/auth/NewPasswordFields.tsx` muestra los requisitos en vivo; la regla está en `utils/password.ts` y el backend aplica la misma.
- **Pago simulado:** `4242 4242 4242 4242` aprueba y `4000 0000 0000 0002` rechaza, con cualquier fecha futura y cualquier CVC. La tarjeta se valida en el navegador (Luhn y fecha, en `utils/card.ts`) y a la API solo viajan la marca y los últimos 4 dígitos.

## Estructura (por capas técnicas)

```
src/
├── components/common        UI reutilizable (Button, Input, Select, Modal, Badge, Switch, Toaster, ProtectedRoute…)
├── components/auth          Login, registro y NewPasswordFields
├── components/subscription  PlanPicker, CheckoutForm, SignupSteps, BackButton
├── components/business      BusinessForm, SlugEditor, ajustes de reservas, WhatsApp y suscripción
├── components/resources     ResourceForm, ResourceCard, WorkingHoursEditor
├── components/team          InviteMemberModal
├── components/agenda        DayGrid, AgendaList, modales de cita y bloqueo
├── components/booking       Pasos de la reserva pública
├── components/dashboard     Sidebar, BusinessSwitcher, avisos (correo sin verificar, negocio suspendido)
├── components/admin         Gráficas y modales del superadministrador
├── pages/                   auth, signup, onboarding, dashboard, admin, public
├── services                 Cliente axios + llamadas a la API
├── store                    authStore, businessStore, bookingStore, agendaStore, toastStore (Zustand)
├── hooks                    useAuth, useActiveBusiness, useAsync, useResources, useTeam…
├── layouts                  AuthLayout, DashboardLayout, PublicLayout
├── constants                Categorías, roles, estados de cita, planes
├── utils                    Formato COP/fechas, slug, horarios, tarjeta, contraseña
└── types                    Tipos compartidos
```
