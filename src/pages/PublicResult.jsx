import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';

export default function PublicResult() {
  const { slug } = useParams();
  const [session, setSession] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      // Ambil session by slug
      const { data: s, error: errS } = await supabase
        .from('sessions')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (errS || !s) {
        setError('Hasil foto tidak ditemukan atau sudah kadaluarsa.');
        setLoading(false);
        return;
      }

      setSession(s);

      // Ambil foto mentah
      const { data: ph } = await supabase
        .from('session_photos')
        .select('*')
        .eq('session_id', s.id)
        .order('slot_index');

      setPhotos(ph || []);
      setLoading(false);
    })();
  }, [slug]);

  const download = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kuning-100">
        <div className="text-benhur-700 font-bold">Memuat hasil foto...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kuning-100 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="font-display text-3xl text-benhur-900 mb-2">Ups!</h1>
          <p className="text-benhur-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kuning-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block bg-benhur-900 text-kuning-300 text-[10px] font-bold tracking-[0.4em] px-3 py-1 rounded-full">
            POTOBOKS
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-benhur-900 mt-3">
            Hasil Fotomu
          </h1>
          <p className="text-benhur-700 text-sm mt-2">
            {session.paket_nama} · {new Date(session.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Final */}
        {session.final_image_url && (
          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-4 shadow-[8px_8px_0_0_#0A1F44]">
            <h2 className="font-extrabold text-benhur-900 mb-3">📸 Hasil Final</h2>
            <img
              src={session.final_image_url}
              alt="Hasil final"
              className="w-full rounded-2xl"
            />
            <button
              onClick={() => download(session.final_image_url, `potoboks-${slug}-final.jpg`)}
              className="btn-sticker bg-kuning-500 text-benhur-900 w-full mt-4"
            >
              ⬇ Download Final
            </button>
          </div>
        )}

        {/* Foto mentah */}
        {photos.length > 0 && (
          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-4 shadow-[8px_8px_0_0_#0A1F44]">
            <h2 className="font-extrabold text-benhur-900 mb-3">🖼 Foto Mentah</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => download(p.photo_url, `potoboks-${slug}-${p.slot_index + 1}.jpg`)}
                  className="rounded-xl overflow-hidden border-2 border-benhur-900/20 hover:border-benhur-900 transition-colors"
                >
                  <img
                    src={p.photo_url}
                    alt={`Foto ${p.slot_index + 1}`}
                    className="w-full block"
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-benhur-700/70 mt-3 text-center">
              Tap foto untuk download
            </p>
          </div>
        )}

        {/* Info retensi */}
        <div className="text-center text-xs text-benhur-700/70">
          Foto mentah akan tersimpan sampai{' '}
          {new Date(session.expired_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>

        <div className="text-center pt-4">
          <a
            href="/"
            className="text-benhur-700 font-bold underline text-sm"
          >
            ← Kembali ke booth
          </a>
        </div>
      </div>
    </div>
  );
}