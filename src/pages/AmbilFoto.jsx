import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { hitungLayout } from '../frames';
import Button from '../components/Button';
import Timer from '../components/Timer';

export default function AmbilFoto() {
  const nav = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { paket, frame, slotCount, photos, addPhoto } = useStore();
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);
  const [mirror, setMirror] = useState(true);

  useEffect(() => { if (!paket || !frame) nav('/'); }, [paket, frame, nav]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) { setError('Tidak bisa akses kamera: ' + e.message); }
    })();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (mirror) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const mulaiSlot = () => {
    if (photos.length >= slotCount) return;
    let n = 3;
    setCountdown(n);
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(t);
        setCountdown(null);
        const dataUrl = capture();
        if (dataUrl) addPhoto(dataUrl);
      } else setCountdown(n);
    }, 1000);
  };

  useEffect(() => {
    if (photos.length >= slotCount && slotCount > 0) {
      const t = setTimeout(() => nav('/preview'), 600);
      return () => clearTimeout(t);
    }
  }, [photos.length, slotCount, nav]);

  const { slots } = hitungLayout(slotCount);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-benhur-900">
      <Timer detik={240} onHabis={() => nav('/')} />

      {/* KIRI: live view */}
      <div className="flex-1 relative bg-benhur-700 flex flex-col min-h-0">
        {/* Header atas live view */}
        <div className="p-3 md:p-4 flex items-center justify-between text-white shrink-0">
          <div className="bg-white/10 border-2 border-white rounded-xl px-3 py-1 text-sm font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle" />
            Foto {Math.min(photos.length + 1, slotCount)} / {slotCount}
          </div>
          <button onClick={() => setMirror(m => !m)}
            className="bg-kuning-500 text-benhur-900 border-2 border-white rounded-xl px-3 py-1 text-sm font-bold">
            Mirror {mirror ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Kamera */}
        <div className="flex-1 min-h-0 flex items-center justify-center p-3 md:p-4">
          {error ? (
            <div className="text-white text-center p-6">{error}</div>
          ) : (
            <div className="relative h-full max-h-full w-full max-w-full aspect-video mx-auto rounded-3xl overflow-hidden border-4 border-white">
              <video ref={videoRef} autoPlay playsInline muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: mirror ? 'scaleX(-1)' : 'none' }} />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="font-display text-[120px] md:text-[180px] text-white drop-shadow-[6px_6px_0_#0A1F44] animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KANAN: preview + tombol */}
      <div className="w-full md:w-[340px] lg:w-[380px] bg-black flex flex-col shrink-0 min-h-0">
        {/* Preview slots */}
        <div className="flex-1 min-h-0 p-3 md:p-4 flex flex-col">
          <div
            className="flex-1 min-h-0 rounded-2xl p-2 md:p-3 flex flex-col gap-1.5 md:gap-2 overflow-hidden"
            style={{ background: frame?.warna_bg || '#fff' }}
          >
            {slots.map((_, i) => (
              <div
                key={i}
                className="flex-1 min-h-0 rounded-xl bg-white/40 border-2 border-benhur-900/20 flex items-center justify-center overflow-hidden"
              >
                {photos[i] ? (
                  <img src={photos[i]} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-benhur-900/50 font-bold text-sm">
                    Photo {i+1}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Info kecil */}
          <div className="text-center text-white/60 text-xs mt-2 shrink-0">
            Foto {photos.length} dari {slotCount}
          </div>
        </div>

        {/* TOMBOL MULAI — di bawah preview */}
        <div className="p-3 md:p-4 border-t-2 border-white/10 shrink-0 bg-black">
          <Button
            onClick={mulaiSlot}
            disabled={photos.length >= slotCount || countdown !== null}
            className="w-full text-lg md:text-xl !py-4"
          >
            {countdown !== null ? '...' : `▶ Mulai (${photos.length}/${slotCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}