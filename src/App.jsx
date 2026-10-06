import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import PilihPaket from './pages/PilihPaket';
import PilihFrame from './pages/PilihFrame';
import AmbilFoto from './pages/AmbilFoto';
import Preview from './pages/Preview';
import Hasil from './pages/Hasil';

export default function App() {
  return (
    <Routes>
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