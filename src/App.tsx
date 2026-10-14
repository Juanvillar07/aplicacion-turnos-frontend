import { lazy, Suspense, type ComponentType } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  GuestRoute,
  ProtectedRoute,
  RequireBusiness,
  RequireManager,
  RequireSuperAdmin,
} from '@/components/common/ProtectedRoute'
import { FullPageSpinner } from '@/components/common/Spinner'
import { Toaster } from '@/components/common/Toaster'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
/**
 * Cada página se descarga solo cuando se visita (code splitting): así la página
 * pública de reservas no carga todo el panel, y viceversa.
 */
function page<K extends string>(
  loader: () => Promise<Record<K, ComponentType>>,
  name: K,
) {
  return lazy(() => loader().then((m) => ({ default: m[name] })))
}

const ForgotPasswordPage = page(() => import('@/pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage')
const InvitationPage = page(() => import('@/pages/auth/InvitationPage'), 'InvitationPage')
const LoginPage = page(() => import('@/pages/auth/LoginPage'), 'LoginPage')
const CreateBusinessSignupPage = page(
  () => import('@/pages/signup/CreateBusinessSignupPage'),
  'CreateBusinessSignupPage',
)
const ResetPasswordPage = page(() => import('@/pages/auth/ResetPasswordPage'), 'ResetPasswordPage')
const AccountPage = page(() => import('@/pages/dashboard/AccountPage'), 'AccountPage')
const CustomerDetailPage = page(() => import('@/pages/dashboard/CustomerDetailPage'), 'CustomerDetailPage')
const CustomersPage = page(() => import('@/pages/dashboard/CustomersPage'), 'CustomersPage')
const MembersPage = page(() => import('@/pages/dashboard/MembersPage'), 'MembersPage')
const AgendaPage = page(() => import('@/pages/dashboard/AgendaPage'), 'AgendaPage')
const OverviewPage = page(() => import('@/pages/dashboard/OverviewPage'), 'OverviewPage')
const ResourcesPage = page(() => import('@/pages/dashboard/ResourcesPage'), 'ResourcesPage')
const ServicesPage = page(() => import('@/pages/dashboard/ServicesPage'), 'ServicesPage')
const SettingsPage = page(() => import('@/pages/dashboard/SettingsPage'), 'SettingsPage')
const CreateBusinessPage = page(() => import('@/pages/onboarding/CreateBusinessPage'), 'CreateBusinessPage')
const BookingPage = page(() => import('@/pages/public/BookingPage'), 'BookingPage')
const ManageAppointmentPage = page(() => import('@/pages/public/ManageAppointmentPage'), 'ManageAppointmentPage')
const ReviewPage = page(() => import('@/pages/public/ReviewPage'), 'ReviewPage')
const ReviewsPage = page(() => import('@/pages/dashboard/ReviewsPage'), 'ReviewsPage')
const AdminBusinessDetailPage = page(
  () => import('@/pages/admin/AdminBusinessDetailPage'),
  'AdminBusinessDetailPage',
)
const AdminBusinessesPage = page(() => import('@/pages/admin/AdminBusinessesPage'), 'AdminBusinessesPage')
const AdminOverviewPage = page(() => import('@/pages/admin/AdminOverviewPage'), 'AdminOverviewPage')
const WhatsappSimulatorPage = page(
  () => import('@/pages/dashboard/WhatsappSimulatorPage'),
  'WhatsappSimulatorPage',
)

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        {/* Páginas públicas para clientes finales: no requieren sesión */}
        <Route path="/b/:slug" element={<BookingPage />} />
        <Route path="/cita/:token" element={<ManageAppointmentPage />} />
        <Route path="/resena/:token" element={<ReviewPage />} />

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* Plan y cuenta (la propia página manda a /onboarding si ya hay sesión).
            Ya no hay registro libre: las cuentas se crean al crear un negocio o por invitación. */}
        <Route element={<AuthLayout width="xl" />}>
          <Route path="/crear-negocio" element={<CreateBusinessSignupPage />} />
        </Route>
        <Route path="/register" element={<Navigate to="/crear-negocio" replace />} />
        {/* La verificación ahora es con código; los enlaces de correos viejos van al panel */}
        <Route path="/verify-email" element={<Navigate to="/app" replace />} />

        {/* Enlaces que llegan por correo: funcionan con o sin sesión */}
        <Route element={<AuthLayout />}>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/invitations/:token" element={<InvitationPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthLayout width="xl" />}>
            <Route path="/onboarding" element={<CreateBusinessPage />} />
          </Route>

          {/* Panel de la plataforma: solo el superadministrador */}
          <Route element={<RequireSuperAdmin />}>
            <Route path="/admin" element={<DashboardLayout variant="admin" />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="businesses" element={<AdminBusinessesPage />} />
              <Route path="businesses/:businessId" element={<AdminBusinessDetailPage />} />
            </Route>
          </Route>

          <Route element={<RequireBusiness />}>
            <Route path="/app" element={<DashboardLayout />}>
              {/* Todos los miembros */}
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:customerId" element={<CustomerDetailPage />} />
              <Route path="account" element={<AccountPage />} />

              {/* Solo administradores */}
              <Route element={<RequireManager />}>
                <Route index element={<OverviewPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="team" element={<ResourcesPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Herramienta de desarrollo: no existe en el build de producción */}
                {import.meta.env.DEV && (
                  <Route path="whatsapp" element={<WhatsappSimulatorPage />} />
                )}
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
