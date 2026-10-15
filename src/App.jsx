import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import LiveSupport from './components/LiveSupport.jsx'
import Home from './pages/Home.jsx'
import Hakkimizda from './pages/Hakkimizda.jsx'
import Ekibimiz from './pages/Ekibimiz.jsx'
import Iletisim from './pages/Iletisim.jsx'
import Faaliyetler from './pages/Faaliyetler.jsx'
import FaaliyetDetay from './pages/FaaliyetDetay.jsx'
import Duyurular from './pages/Duyurular.jsx'
import DuyuruDetay from './pages/DuyuruDetay.jsx'
import MisirTuru from './pages/MisirTuru.jsx'
import MisirBasvuru from './pages/MisirBasvuru.jsx'
import UyeOl from './pages/UyeOl.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminRoutes from './admin/AdminRoutes.jsx'

export default function App() {
  const location = useLocation()
  const { pathname } = location
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  if (pathname.startsWith('/yonetim')) return <AdminRoutes />
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/hakkimizda" element={<Hakkimizda />} />
          <Route path="/ekibimiz" element={<Ekibimiz />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/faaliyetler" element={<Faaliyetler />} />
          <Route path="/faaliyetler/:slug" element={<FaaliyetDetay />} />
          <Route path="/duyurular" element={<Duyurular />} />
          <Route path="/duyurular/:slug" element={<DuyuruDetay />} />
          <Route path="/misir-turu" element={<MisirTuru />} />
          <Route path="/misir-turu/basvuru" element={<MisirBasvuru />} />
          <Route path="/uye-ol" element={<UyeOl />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <LiveSupport />
    </>
  )
}
