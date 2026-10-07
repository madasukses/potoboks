import { useLocation } from 'react-router-dom';

const TITLES = {
  '/admin/paket': { title: 'Paket', emoji: '💳', desc: 'Kelola paket foto: nama, harga, jumlah slot.' },
  '/admin/frame': { title: 'Frame', emoji: '🖼', desc: 'Kelola frame: upload PNG, atur slot, aktif/nonaktif.' },
  '/admin/voucher': { title: 'Voucher', emoji: '🎟', desc: 'Bikin dan kelola voucher gratis/diskon.' },
  '/admin/statistik': { title: 'Statistik', emoji: '📊', desc: 'Omzet, jumlah sesi, paket terlaris, jam tersibuk.' },
  '/admin/pengaturan': { title: 'Pengaturan', emoji: '⚙️', desc: 'Identitas bisnis, branding, dan preferensi.' },
};

export default function Placeholder() {
  const { pathname } = useLocation();
  const info = TITLES[pathname] || { title: 'Halaman', emoji: '🚧', desc: '' };

  return (
    <div>
      <h1 className="font-display text-3xl text-benhur-900 mb-2">
        {info.emoji} {info.title}
      </h1>
      <p className="text-benhur-700/70 text-sm mb-6">{info.desc}</p>

      <div className="bg-white border-4 border-benhur-900 rounded-3xl p-10 shadow-[8px_8px_0_0_#0A1F44] text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="font-display text-2xl text-benhur-900">Segera Hadir</h2>
        <p className="text-benhur-700 mt-2 text-sm">
          Fitur ini sedang dalam pengerjaan.
        </p>
      </div>
    </div>
  );
}