import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../supabase';
import Timer from '../components/Timer';

const FALLBACK = [
  { id:'pop-snap', nama:'Pop Snap', harga:15000, slot:4, deskripsi:'1 cetakan + semua softfile', catatan:'1 cetakan termasuk · extra Rp 5.000/cetak' },
  { id:'snap-fast', nama:'SnapFast', harga:20000, slot:6, deskripsi:'1 cetakan cepat + softfile', catatan:'1 cetakan termasuk · extra Rp 5.000/cetak' },
];

export default function PilihPaket() {
  const nav = useNavigate();
  const setPaket = useStore(s => s.setPaket);
  const setSlotCount = useStore(s => s.setSlotCount);
  const [list, setList] = useState(FALLBACK);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('paket')
        .select('*')
        .eq('aktif', true)
        .order('harga', { ascending: true });
      if (!error && data?.length) setList(data);
    })();
  }, []);

  const pilih = (p) => {
    setPaket(p);
    setSlotCount(p.slot);
    nav('/frame');
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-16">
      <Timer detik={300} onHabis={() => nav('/')} />

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => nav('/')}
            className="bg-white border-4 border-benhur-900 rounded-xl px-5 py-2 font-bold shadow-[4px_4px_0_0_#0A1F44] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0A1F44] transition"
          >
            ← Kembali
          </button>
          <div className="text-right">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70">
              LANGKAH 1 DARI 3
            </div>
            <div className="font-display text-lg text-benhur-900">Pilih Paket</div>
          </div>
        </div>

        <h2 className="font-display text-4xl md:text-5xl text-benhur-900 mb-2">
          Mau paket yang mana?
        </h2>
        <p className="text-benhur-700/70 mb-8">
          Tap paket untuk melanjutkan.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => pilih(p)}
              className="text-left bg-kuning-100 border-4 border-benhur-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0_0_#0A1F44] flex flex-col cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#0A1F44] hover:bg-kuning-300/60 active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0_0_#0A1F44] focus:outline-none focus:ring-4 focus:ring-benhur-500/40"
            >
              <div className="text-xs font-bold tracking-widest text-benhur-700/70">
                PAKET
              </div>
              <h3 className="font-display text-4xl text-benhur-900 mt-1">
                {p.nama}
              </h3>
              {p.deskripsi && (
                <p className="text-benhur-700 mt-2">{p.deskripsi}</p>
              )}

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <div className="text-3xl font-extrabold text-benhur-900">
                    Rp {p.harga.toLocaleString('id-ID')}
                  </div>
                  {p.catatan && (
                    <div className="text-sm text-benhur-700/70 mt-1">
                      {p.catatan}
                    </div>
                  )}
                </div>
                <span className="shrink-0 bg-kuning-500 text-benhur-900 border-4 border-benhur-900 rounded-full px-6 py-3 font-extrabold shadow-[4px_4px_0_0_#0A1F44] text-sm">
                  Pilih →
                </span>
              </div>
            </button>
          ))}
        </div>

        {list.length === 0 && (
          <div className="text-center text-benhur-700 py-20">
            Belum ada paket aktif. Hubungi admin.
          </div>
        )}
      </div>
    </div>
  );
}