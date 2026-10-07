import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../supabase';
import { FRAMES_FALLBACK } from '../frames';
import Timer from '../components/Timer';

export default function PilihFrame() {
  const nav = useNavigate();
  const setFrame = useStore(s => s.setFrame);
  const setSlotCount = useStore(s => s.setSlotCount);
  const paket = useStore(s => s.paket);
  const [list, setList] = useState(FRAMES_FALLBACK);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('frame')
        .select('*')
        .eq('aktif', true)
        .order('nama');
      if (!error && data?.length) setList(data);
    })();
  }, []);

  // Filter frame sesuai slot paket
  const filtered = paket?.slot
    ? list.filter(f => f.slot_count === paket.slot)
    : list;

  // Kalau tidak ada yang cocok, tampilkan semua
  const display = filtered.length > 0 ? filtered : list;

  const pilih = (f) => {
    setSelectedId(f.id);
    setFrame(f);
    // kalau paket tidak set slot, pakai slot dari frame
    if (!paket?.slot) setSlotCount(f.slot_count);
    // Delay kecil biar animasi terlihat
    setTimeout(() => nav('/foto'), 180);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <Timer detik={280} onHabis={() => nav('/')} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => nav('/paket')}
            className="bg-white border-4 border-benhur-900 rounded-xl px-5 py-2 font-bold shadow-[4px_4px_0_0_#0A1F44] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0A1F44] transition"
          >
            ← Kembali
          </button>
          <div className="text-right">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70">
              LANGKAH 2 DARI 3
            </div>
            <div className="font-display text-lg text-benhur-900">Pilih Frame</div>
          </div>
        </div>

        <h2 className="font-display text-4xl md:text-5xl text-benhur-900 mb-2">
          Pilih frame favoritmu
        </h2>
        <p className="text-benhur-700/70 mb-8">
          {paket?.slot
            ? `Frame untuk paket ${paket.nama} (${paket.slot} slot)`
            : 'Tap frame untuk melanjutkan.'}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {display.map((f) => {
            const isSelected = selectedId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => pilih(f)}
                disabled={isSelected}
                className={`
                  group text-left bg-white border-4 border-benhur-900 rounded-2xl p-3 md:p-4
                  shadow-[6px_6px_0_0_#0A1F44] cursor-pointer
                  transition-all duration-150
                  hover:-translate-y-1 hover:shadow-[9px_9px_0_0_#0A1F44] hover:bg-kuning-100
                  active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0_0_#0A1F44]
                  focus:outline-none focus:ring-4 focus:ring-benhur-500/40
                  ${isSelected ? 'ring-4 ring-kuning-500 bg-kuning-100 scale-[0.98] shadow-[2px_2px_0_0_#0A1F44] translate-x-[4px] translate-y-[4px]' : ''}
                `}
              >
                {/* Preview mini frame */}
                <div
                  className="w-full aspect-[2/3] rounded-lg mb-3 border-2 border-benhur-900/20 flex flex-col gap-1.5 p-2 overflow-hidden relative"
                  style={{ background: f.warna_bg }}
                >
                  {/* Slot-slot mini */}
                  {Array.from({ length: Math.min(f.slot_count, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded bg-white/50 border border-benhur-900/20"
                    />
                  ))}
                  {f.slot_count > 4 && (
                    <div className="absolute bottom-1 right-1 bg-benhur-900 text-kuning-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      +{f.slot_count - 4}
                    </div>
                  )}

                  {/* Aksen bulat */}
                  <div
                    className="absolute top-1 right-1 w-4 h-4 rounded-full border border-benhur-900/30"
                    style={{ background: f.warna_aksen }}
                  />
                </div>

                {/* Info */}
                <div className="font-extrabold text-benhur-900 text-sm md:text-base leading-tight">
                  {f.nama}
                </div>
                <div className="text-[11px] md:text-xs font-bold text-benhur-700/60 mt-0.5">
                  {f.slot_count} slot
                </div>

                {/* Badge "Pilih" muncul saat hover */}
                <div className="mt-2 text-[11px] font-extrabold text-benhur-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Pilih →
                </div>
              </button>
            );
          })}
        </div>

        {display.length === 0 && (
          <div className="text-center text-benhur-700 py-20">
            Belum ada frame aktif. Hubungi admin.
          </div>
        )}
      </div>
    </div>
  );
}