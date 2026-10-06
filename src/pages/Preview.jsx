import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { hitungLayout } from '../frames';
import Button from '../components/Button';
import Timer from '../components/Timer';

export default function Preview() {
  const nav = useNavigate();
  const { photos, frame, slotCount, retakeLeft, replacePhoto } = useStore();
  const canvasRef = useRef(null);

  useEffect(() => { if (!frame || photos.length === 0) nav('/'); }, [frame, photos, nav]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;
    const { W, H, slots } = hitungLayout(slotCount);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = frame.warna_bg;
    ctx.fillRect(0, 0, W, H);

    let done = 0;
    photos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        const s = slots[i];
        if (s) drawCover(ctx, img, s.x, s.y, s.w, s.h);
        done += 1;
        if (done === photos.length) {
          ctx.strokeStyle = frame.warna_aksen;
          ctx.lineWidth = 12;
          ctx.strokeRect(6, 6, W - 12, H - 12);
          try { localStorage.setItem('potoboks-final', canvas.toDataURL('image/jpeg', 0.9)); } catch (e) {}
        }
      };
      img.src = src;
    });
  }, [photos, frame, slotCount]);

  const retake = (idx) => {
    if (retakeLeft <= 0) return;
    const dummy = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    replacePhoto(idx, dummy);
    nav('/foto');
  };

  return (
    <div className="min-h-screen bg-benhur-900 p-4 flex flex-col items-center">
      <Timer detik={200} onHabis={() => nav('/')} />
      <div className="w-full max-w-3xl text-center mt-2">
        <div className="text-xs font-bold tracking-widest text-kuning-300">HASIL FOTO</div>
        <div className="mt-2 inline-block bg-white text-benhur-900 text-sm font-bold rounded-xl px-4 py-2 border-4 border-benhur-900">
          Tap foto untuk retake · sisa {retakeLeft}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-3xl">
        {photos.map((p, i) => (
          <button key={i} onClick={() => retake(i)}
            className="relative rounded-2xl overflow-hidden border-4 border-white">
            <img src={p} alt={`Foto ${i+1}`} className="w-full h-auto block" />
            <span className="absolute top-2 right-2 bg-kuning-500 text-benhur-900 rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-benhur-900">
              ↻
            </span>
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-8">
        <Button onClick={() => nav('/hasil')} className="text-xl">Lanjut</Button>
      </div>
    </div>
  );
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const sr = w / h;
  let sw, sh, sx, sy;
  if (ir > sr) {
    sh = img.height;
    sw = sh * sr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / sr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}