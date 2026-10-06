import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-kuning-100 relative overflow-hidden no-select">
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-benhur-100 blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-kuning-300 blur-3xl opacity-60" />
      <div className="relative z-10"><Outlet /></div>
    </div>
  );
}