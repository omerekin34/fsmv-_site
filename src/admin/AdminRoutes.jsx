import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './RequireAuth.jsx'
import AdminLayout from './AdminLayout.jsx'
import Giris from './pages/Giris.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Uyeler from './pages/Uyeler.jsx'
import MisirTuruAdmin from './pages/MisirTuruAdmin.jsx'
import Etkinlikler from './pages/Etkinlikler.jsx'
import Ekip from './pages/Ekip.jsx'
import Faaliyetler from './pages/Faaliyetler.jsx'
import Mesajlar from './pages/Mesajlar.jsx'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/yonetim/giris" element={<Giris />} />
      <Route element={<RequireAuth />}>
        <Route path="/yonetim" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="uyeler" element={<Uyeler />} />
          <Route path="misir-turu" element={<MisirTuruAdmin />} />
          <Route path="etkinlikler" element={<Etkinlikler />} />
          <Route path="ekip" element={<Ekip />} />
          <Route path="faaliyetler" element={<Faaliyetler />} />
          <Route path="mesajlar" element={<Mesajlar />} />
        </Route>
      </Route>
      <Route path="/yonetim/*" element={<Navigate to="/yonetim" replace />} />
    </Routes>
  )
}
