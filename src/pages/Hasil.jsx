import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useStore } from '../store';
import { simpanSesi } from '../lib/session';
import Button from '../components/Button';

export default function Hasil() {
  const nav = useNavigate();
  const reset = useStore((s) => s.reset);
  const { paket, frame, photos, retakeLeft } = useStore();

  const [finalImg, setFinalImg] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [slug, setSlug] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('potoboks-final');
    if (saved) setFinalImg(saved);
  }, []);

  useEffect(() => {
    if (!finalImg || !paket || !frame || !photos.length) return;
    if (status !== 'loading') return;

    const sessionId = sessionStorage.getItem('potoboks-session-id');
    if (!sessionId) {
      setErrMsg('Session ID tidak ditemukan. Coba ulang dari awal.');
      setStatus('error');
      return;
    }

    (async () => {
      try {
        setStatus('uploading');
        const result = await simpanSesi({
          paket,
          frame,
          photos: photos.filter((p) => !p.startsWith('data:image/gif')),
          finalDataUrl: finalImg,
          retakeLeft,
          sessionId,
        });
        setShareUrl(result.shareUrl);
        setSlug(result.slug);
        setStatus('done');
      } catch (e) {
        console.error('Upload error:', e);
        setErrMsg(e.message || 'Gagal upload');
        setStatus('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalImg, paket, frame, photos, retakeLeft, status]);

  const download = () => {
    if (!finalImg) return;
    const a = document.createElement('a');
    a.href = finalImg;
    a.download = (slug || 'potoboks') + '-final.jpg';
    a.click();
  };

  const selesai = () => {
    sessionStorage.removeItem('potoboks-session-id');
    reset();
    nav('/');
  };

  return (
    <div className="min-h-screen bg-kuning-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white border-4 border-benhur-900 rounded-3xl p-4 shadow-[8px_8px_0_0_#0A1F44]">
          <h2 className="font-display text-3xl text-benhur-900 mb-3">
            Hasil Foto
          </h2>
          <div className="rounded-2xl overflow-hidden border-2 border-benhur-900/20 bg-benhur-100 flex items-center justify-center">
            {finalImg ? (
              <img src={finalImg} alt="Hasil" className="max-h-[70vh] w-auto" />
            ) : (
              <div className="p-10 text-benhur-700">Memuat hasil...</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-5 shadow-[8px_8px_0_0_#0A1F44]">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70">
              DOWNLOAD SOFTFILE
            </div>

            {status === 'loading' && (
              <div className="mt-3 text-center text-benhur-700 text-sm py-8">
                Menyiapkan...
              </div>
            )}

            {status === 'uploading' && (
              <div className="mt-3 text-center text-benhur-700 text-sm py-8">
                <div className="text-2xl mb-2">⏳</div>
                Mengunggah foto...
              </div>
            )}

            {status === 'done' && shareUrl && (
              <div className="mt-3 bg-kuning-100 border-2 border-benhur-900/20 rounded-2xl p-4 flex flex-col items-center">
                <QRCodeCanvas value={shareUrl} size={180} />
                <div className="text-xs text-benhur-700 mt-2 text-center break-all">
                  {shareUrl}
                </div>
                <div className="text-xs text-benhur-700 mt-2 text-center font-bold">
                  Scan QR untuk download
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-center">
                <div className="text-red-600 font-bold text-sm">
                  Upload gagal
                </div>
                <div className="text-red-500 text-xs mt-1">{errMsg}</div>
              </div>
            )}
          </div>

          <Button onClick={download} className="w-full" disabled={!slug}>
            Download Lokal
          </Button>
          <Button onClick={selesai} variant="secondary" className="w-full">
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}