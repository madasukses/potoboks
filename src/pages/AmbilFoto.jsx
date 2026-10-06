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
    <div className="min-h-screen flex flex-col md:flex-row bg-benhur-900">
      <Timer detik={240} onHabis={() => nav('/')} />

      <div className="flex-1 relative bg-benhur-700 flex flex-col">
        <div className="p-4 flex items-center justify-between text-white">
          <div className="bg-white/10 border-2 border-white rounded-xl px-3 py-1 text-sm font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle" />
            Foto {Math.min(photos.length + 1, slotCount)} / {slotCount}
          </div>
          <button onClick={() => setMirror(m => !m)}
            className="bg-kuning-500 text-benhur-900 border-2 border-white rounded-xl px-3 py-1 text-sm font-bold">
            Mirror {mirror ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="relative flex-1 flex items-center justify-center p-4">
          {error ? (
            <div className="text-white text-center p-6">{error}</div>
          ) : (
            <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-4 border-white">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover"
                style={{ transform: mirror ? 'scaleX(-1)' : 'none' }} />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="font-display text-[120px] text-white drop-shadow-[6px_6px_0_#0A1F44]">
                    {countdown}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col items-center gap-3">
          <h3 className="text-white font-extrabold text-2xl">Siap berfoto?</h3>
          <p className="text-white/70 text-sm">Atur posisi dulu, lalu tap Mulai</p>
          <Button onClick={mulaiSlot}
            disabled={photos.length >= slotCount || countdown !== null}
            className="text-xl">
            {countdown !== null ? '...' : `Mulai (${photos.length}/${slotCount})`}
          </Button>
        </div>
      </div>

      <div className="w-full md:w-[380px] bg-black p-4 flex flex-col">
        <div className="flex-1 rounded-2xl p-3 flex flex-col gap-2"
          style={{ background: frame?.warna_bg || '#fff' }}>
          {slots.map((_, i) => (
            <div key={i}
              className="rounded-xl bg-white/40 border-2 border-benhur-900/20 flex items-center justify-center overflow-hidden"
              style={{ aspectRatio: '4/3' }}>
              {photos[i] ? (
                <img src={photos[i]} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-benhur-900/50 font-bold">Photo {i+1}</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-white/60 text-sm mt-3">
          Foto {photos.length} dari {slotCount}
        </div>
      </div>
    </div>
  );
}