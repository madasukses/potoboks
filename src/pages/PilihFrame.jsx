import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../supabase';
import { FRAMES_FALLBACK } from '../frames';
import Timer from '../components/Timer';

export default function PilihFrame() {
  const nav = useNavigate();
  const setFrame = useStore(s => s.setFrame);
  const paket = useStore(s => s.paket);
  const [list, setList] = useState(FRAMES_FALLBACK);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('frame').select('*').eq('aktif', true);
      if (!error && data?.length) setList(data);
    })();
  }, []);

  const pilih = (f) => { setFrame(f); nav('/foto'); };

  return (
    <div className="min-h-screen px-4 py-8">
      <Timer detik={280} onHabis={() => nav('/')} />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => nav('/paket')}
            className="bg-white border-4 border-benhur-900 rounded-xl px-5 py-2 font-bold shadow-[4px_4px_0_0_#0A1F44]">
            Kembali
          </button>
          <div className="text-right">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70">PAKET</div>
            <div className="font-extrabold text-benhur-900">{paket?.nama}</div>
          </div>
        </div>

        <h2 className="font-display text-4xl md:text-5xl text-benhur-900 mb-6">Pilih Frame</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {list.map((f) => (
            <button key={f.id} onClick={() => pilih(f)}
              className="bg-white border-4 border-benhur-900 rounded-2xl p-4 shadow-[6px_6px_0_0_#0A1F44] hover:-translate-y-1 transition-transform text-left">
              <div className="w-full aspect-[2/3] rounded-lg mb-3 border-2 border-benhur-900/20 flex items-center justify-center"
                style={{ background: f.warna_bg }}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ background: f.warna_aksen }} />
                  <div className="text-xs font-bold text-benhur-900/70">{f.slot_count} slot</div>
                </div>
              </div>
              <div className="font-extrabold text-benhur-900">{f.nama}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}