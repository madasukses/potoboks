import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const NAV = [
  { to: '/admin/sesi', label: 'Sesi', icon: '📸' },
  { to: '/admin/pembayaran', label: 'Pembayaran', icon: '💰' },
  { to: '/admin/paket', label: 'Paket', icon: '💳' },
  { to: '/admin/frame', label: 'Frame', icon: '🖼' },
  { to: '/admin/voucher', label: 'Voucher', icon: '🎟' },
  { to: '/admin/statistik', label: 'Statistik', icon: '📊' },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: '⚙️' },
];

export default function AdminLayout() {
  const nav = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    nav('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-kuning-100 flex">
      <aside className="w-56 shrink-0 bg-benhur-900 text-white flex flex-col min-h-screen sticky top-0 h-screen">
        <div className="p-5 border-b border-white/10">
          <div className="font-display text-2xl text-kuning-300 tracking-wide">
            potoboks
          </div>
          <div className="text-[10px] font-bold tracking-[0.3em] text-white/60 mt-1">
            ADMIN
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                'flex items-center gap-3 px-5 py-3 text-sm font-bold transition border-l-4 ' +
                (isActive
                  ? 'bg-white/10 border-kuning-500 text-kuning-300'
                  : 'border-transparent text-white/80 hover:bg-white/5 hover:text-white')
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-white/50">
          v0.1.0 · potoboks
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b-4 border-benhur-900 px-5 py-3 flex justify-between items-center sticky top-0 z-10">
          <div className="text-sm font-bold text-benhur-700">Panel Admin</div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-benhur-700/60 hidden md:inline">
              admin@potoboks.id
            </span>
            <button
              onClick={logout}
              className="bg-kuning-500 text-benhur-900 border-4 border-benhur-900 rounded-full px-4 py-1.5 text-xs font-extrabold shadow-[3px_3px_0_0_#0A1F44] hover:bg-kuning-300 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#0A1F44]"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}