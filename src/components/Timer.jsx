import { useEffect, useState } from 'react';

export default function Timer({ detik = 300, onHabis }) {
  const [sisa, setSisa] = useState(detik);

  useEffect(() => {
    if (sisa <= 0) { onHabis?.(); return; }
    const t = setTimeout(() => setSisa(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sisa, onHabis]);

  const m = String(Math.floor(sisa / 60)).padStart(2, '0');
  const s = String(sisa % 60).padStart(2, '0');

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border-4 border-benhur-900 rounded-2xl px-4 py-2 shadow-[4px_4px_0_0_#0A1F44]">
      <div className="text-[10px] font-bold text-benhur-900/60 tracking-widest">SISA WAKTU</div>
      <div className="text-2xl font-extrabold text-benhur-900 leading-none">{m}:{s}</div>
    </div>
  );
}