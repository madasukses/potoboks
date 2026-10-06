import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../supabase';
import Button from '../components/Button';
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
      const { data, error } = await supabase.from('paket').select('*').eq('aktif', true);
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
      <button
        onClick={() => nav('/')}
        className="mb-6 ml-2 bg-white border-4 border-benhur-900 rounded-xl px-5 py-2 font-bold shadow-[4px_4px_0_0_#0A1F44]"
      >
        Kembali
      </button>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {list.map((p) => (
          <div key={p.id}
            className="bg-kuning-100 border-4 border-benhur-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0_0_#0A1F44] flex flex-col">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70">PAKET</div>
            <h2 className="font-display text-4xl text-benhur-900 mt-1">{p.nama}</h2>
            <p className="text-benhur-700 mt-2">{p.deskripsi}</p>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="text-3xl font-extrabold text-benhur-900">
                  Rp {p.harga.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-benhur-700/70 mt-1">{p.catatan}</div>
              </div>
              <Button onClick={() => pilih(p)} className="!px-6 !py-3">Pilih</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}