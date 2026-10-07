import { useState } from 'react';
import { Rnd } from 'react-rnd';

const PRESET_COLORS = [
  { name: 'Magenta', value: '#FF00AA' },
  { name: 'Merah', value: '#E63946' },
  { name: 'Merah Bata', value: '#B23A48' },
  { name: 'Hijau', value: '#00C853' },
  { name: 'Hijau Tua', value: '#1B5E20' },
  { name: 'Ungu', value: '#7B2CBF' },
  { name: 'Cyan', value: '#00B8D4' },
  { name: 'Biru', value: '#1565C0' },
  { name: 'Oranye', value: '#FF6D00' },
  { name: 'Hitam', value: '#000000' },
];

export default function SlotEditor({
  overlayUrl,
  canvasW = 600,
  canvasH = 1760,
  slots = [],
  onChange,
  maxSlots = 10,
}) {
  const [borderColor, setBorderColor] = useState('#FF00AA');
  const [fillOpacity, setFillOpacity] = useState(0.25);
  const [borderWidth, setBorderWidth] = useState(2);

  // Skala tampilan: lebih besar dari sebelumnya (dari 380 → 560)
  const maxDisplayW = 560;
  const maxDisplayH = 620; // batas tinggi supaya tidak overflow modal
  const scaleW = maxDisplayW / canvasW;
  const scaleH = maxDisplayH / canvasH;
  const scale = Math.min(1, scaleW, scaleH);
  const displayW = canvasW * scale;
  const displayH = canvasH * scale;

  const updateSlot = (index, patch) => {
    const next = slots.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  };

  const addSlot = () => {
    if (slots.length >= maxSlots) return;
    const last = slots[slots.length - 1];
    const newSlot = last
      ? { x: last.x, y: last.y + last.h + 20, w: last.w, h: last.h }
      : { x: 40, y: 40, w: canvasW - 80, h: 400 };
    onChange([...slots, newSlot]);
  };

  const removeSlot = (index) => {
    onChange(slots.filter((_, i) => i !== index));
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      {/* ============ KIRI: Canvas ============ */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-bold tracking-widest text-benhur-700/70 mb-2 self-start">
          PREVIEW — drag & resize kotak
        </div>

        <div
          className="relative border-4 border-benhur-900 rounded-xl overflow-hidden mx-auto"
          style={{
            width: displayW,
            height: displayH,
            background: '#f0f0f0',
          }}
        >
          {overlayUrl && (
            <img
              src={overlayUrl}
              alt="Overlay"
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
              draggable={false}
            />
          )}

          {slots.map((slot, i) => (
            <Rnd
              key={i}
              size={{
                width: slot.w * scale,
                height: slot.h * scale,
              }}
              position={{
                x: slot.x * scale,
                y: slot.y * scale,
              }}
              onDragStop={(_e, d) => {
                updateSlot(i, {
                  x: Math.round(d.x / scale),
                  y: Math.round(d.y / scale),
                });
              }}
              onResizeStop={(_e, _dir, ref, _delta, pos) => {
                updateSlot(i, {
                  x: Math.round(pos.x / scale),
                  y: Math.round(pos.y / scale),
                  w: Math.round(parseInt(ref.style.width) / scale),
                  h: Math.round(parseInt(ref.style.height) / scale),
                });
              }}
              bounds="parent"
              style={{
                border: borderWidth + 'px dashed ' + borderColor,
                background: hexToRgba(borderColor, fillOpacity),
                zIndex: 10,
              }}
            >
              <div
                className="absolute top-1 left-1 text-[10px] font-extrabold px-2 py-0.5 rounded pointer-events-none text-white"
                style={{ background: borderColor }}
              >
                Slot {i + 1}
              </div>
            </Rnd>
          ))}
        </div>

        <div className="text-center text-xs text-benhur-700/60 mt-3">
          Canvas: {canvasW} × {canvasH} px · Zoom: {Math.round(scale * 100)}%
        </div>
      </div>

      {/* ============ KANAN: Kontrol ============ */}
      <div className="space-y-4">
        {/* Warna */}
        <div className="bg-kuning-100 border-2 border-benhur-900 rounded-xl p-3">
          <div className="text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            WARNA KOTAK
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setBorderColor(c.value)}
                title={c.name}
                className={
                  'w-8 h-8 rounded-lg border-2 transition ' +
                  (borderColor === c.value
                    ? 'border-benhur-900 ring-2 ring-benhur-900 ring-offset-1'
                    : 'border-white')
                }
                style={{ background: c.value }}
              />
            ))}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <span className="font-bold text-benhur-700 w-16">Custom:</span>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-2 border-benhur-900 cursor-pointer"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="flex-1 border-2 border-benhur-900 rounded px-2 py-1 font-mono text-xs"
              />
            </label>

            <label className="flex items-center gap-2 text-xs">
              <span className="font-bold text-benhur-700 w-16">Isi:</span>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                className="flex-1 accent-benhur-900"
              />
              <span className="text-benhur-700 w-10 text-right">
                {Math.round(fillOpacity * 100)}%
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs">
              <span className="font-bold text-benhur-700 w-16">Border:</span>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                className="flex-1 accent-benhur-900"
              />
              <span className="text-benhur-700 w-10 text-right">
                {borderWidth}px
              </span>
            </label>
          </div>
        </div>

        {/* Slot */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold tracking-widest text-benhur-700/70">
            SLOT ({slots.length})
          </div>
          <button
            type="button"
            onClick={addSlot}
            disabled={slots.length >= maxSlots}
            className="bg-kuning-500 text-benhur-900 border-2 border-benhur-900 rounded-full px-3 py-1 text-xs font-extrabold shadow-[2px_2px_0_0_#0A1F44] disabled:opacity-40"
          >
            + Tambah
          </button>
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {slots.map((slot, i) => (
            <div
              key={i}
              className="bg-kuning-100 border-2 border-benhur-900 rounded-xl p-2 text-xs"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-extrabold text-benhur-900">
                  Slot {i + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="text-red-600 font-bold hover:underline"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <NumInput
                  label="X"
                  value={slot.x}
                  onChange={(v) => updateSlot(i, { x: v })}
                />
                <NumInput
                  label="Y"
                  value={slot.y}
                  onChange={(v) => updateSlot(i, { y: v })}
                />
                <NumInput
                  label="W"
                  value={slot.w}
                  onChange={(v) => updateSlot(i, { w: v })}
                />
                <NumInput
                  label="H"
                  value={slot.h}
                  onChange={(v) => updateSlot(i, { h: v })}
                />
              </div>
            </div>
          ))}

          {slots.length === 0 && (
            <div className="text-center text-xs text-benhur-700/60 py-4">
              Belum ada slot. Klik "+ Tambah".
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                'Reset slot jadi 4 kotak default? Slot yang ada akan hilang.'
              )
            ) {
              const defaultW = canvasW - 80;
              const defaultH = Math.floor((canvasH - 100) / 4) - 20;
              onChange([
                { x: 40, y: 40, w: defaultW, h: defaultH },
                {
                  x: 40,
                  y: 40 + defaultH + 20,
                  w: defaultW,
                  h: defaultH,
                },
                {
                  x: 40,
                  y: 40 + (defaultH + 20) * 2,
                  w: defaultW,
                  h: defaultH,
                },
                {
                  x: 40,
                  y: 40 + (defaultH + 20) * 3,
                  w: defaultW,
                  h: defaultH,
                },
              ]);
            }
          }}
          className="w-full text-xs font-bold text-benhur-700 underline"
        >
          Reset slot default
        </button>
      </div>
    </div>
  );
}

function NumInput({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-1 bg-white border-2 border-benhur-900 rounded-lg px-2 py-1">
      <span className="font-bold text-benhur-700/70 text-[10px]">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full text-xs font-bold text-benhur-900 focus:outline-none bg-transparent"
      />
    </label>
  );
}