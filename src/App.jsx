import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './layouts/AdminLayout';
import Landing from './pages/Landing';
import PilihPaket from './pages/PilihPaket';
import PilihFrame from './pages/PilihFrame';
import AmbilFoto from './pages/AmbilFoto';
import Preview from './pages/Preview';
import Hasil from './pages/Hasil';
import PublicResult from './pages/PublicResult';
import AdminLogin from './pages/admin/Login';
import AdminSesi from './pages/admin/Sesi';
import AdminPaket from './pages/admin/Paket';
import AdminPlaceholder from './pages/admin/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route path="/r/:slug" element={<PublicResult />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Navigate to="/admin/sesi" replace />} />
        <Route path="sesi" element={<AdminSesi />} />
        <Route path="paket" element={<AdminPaket />} />
        <Route path="frame" element={<AdminPlaceholder />} />
        <Route path="voucher" element={<AdminPlaceholder />} />
        <Route path="statistik" element={<AdminPlaceholder />} />
        <Route path="pengaturan" element={<AdminPlaceholder />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/paket" element={<PilihPaket />} />
        <Route path="/frame" element={<PilihFrame />} />
        <Route path="/foto" element={<AmbilFoto />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/hasil" element={<Hasil />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}