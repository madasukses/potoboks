import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useStore } from '../store';
import Button from '../components/Button';

export default function Hasil() {
  const nav = useNavigate();
  const reset = useStore(s => s.reset);
  const [finalImg, setFinalImg] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('potoboks-final');
    if (saved) setFinalImg(saved);
  }, []);

  const download = () => {
    if (!finalImg) return;
    const a = document.createElement('a');
    a.href = finalImg;
    a.download = `potoboks-${Date.now()}.jpg`;
    a.click();
  };

  const selesai = () => {
    reset();
    nav('/');
  };

  return (
    <div className="min-h-screen bg-kuning-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white border-4 border-benhur-900 rounded-3xl p-4 shadow-[8px_8px_0_0_#0A1F44]">
          <h2 className="font-display text-3xl text-benhur-900 mb-3">Hasil Foto</h2>
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
            <div className="mt-3 bg-kuning-100 border-2 border-benhur-900/20 rounded-2xl p-4 flex flex-col items-center">
              {finalImg && <QRCodeCanvas value={finalImg.slice(0, 2000)} size={180} />}
              <div className="text-xs text-benhur-700 mt-2 text-center">
                Scan QR atau download langsung
              </div>
            </div>
          </div>

          <Button onClick={download} className="w-full">Download Foto</Button>
          <Button onClick={selesai} variant="secondary" className="w-full">Selesai</Button>
        </div>
      </div>
    </div>
  );
}
