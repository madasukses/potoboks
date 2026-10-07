import { useEffect, useState } from 'react';
import Button from '../Button';
import SlotEditor from './SlotEditor';
import { generateFrameId } from '../../lib/frame';

const EMPTY = {
  id: '',
  nama: '',
  slot_count: 4,
  warna_bg: '#FFF6D6',
  warna_aksen: '#FFC93C',
  urutan: 0,
  aktif: true,
  overlay_url: '',
  canvas_w: 600,
  canvas_h: 1760,
  slots: [],
};

export default function FrameForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  onUploadOverlay,
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        slots: Array.isArray(initial.slots) ? initial.slots : [],
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onNamaChange = (v) => {
    set('nama', v);
    if (!isEdit) set('id', generateFrameId(v));
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.id) {
      setError('Isi nama frame dulu sebelum upload PNG.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await onUploadOverlay(file, form.id);
      set('overlay_url', url);

      // Auto-detect ukuran PNG asli → set canvas
      const img = new Image();
      img.onload = () => {
        setForm((f) => ({
          ...f,
          overlay_url: url,
          canvas_w: img.naturalWidth,
          canvas_h: img.naturalHeight,
        }));
      };
      img.src = url;
    } catch (err) {
      setError('Gagal upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nama.trim()) return setError('Nama frame wajib diisi');
    if (!form.id.trim()) return setError('ID frame tidak valid');

    // Set slot_count = jumlah slot yang diatur
    const payload = {
      ...form,
      slot_count: form.slots.length || form.slot_count,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Nama + ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            NAMA FRAME
          </label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => onNamaChange(e.target.value)}
            placeholder="mis. Good Vibes"
            className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            ID (SLUG)
          </label>
          <input
            type="text"
            value={form.id}
            onChange={(e) => set('id', e.target.value)}
            disabled={isEdit}
            className={
              'w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-kuning-300 ' +
              (isEdit ? 'bg-gray-100 text-gray-500' : '')
            }
          />
        </div>
      </div>

      {/* Upload PNG */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          PNG OVERLAY
        </label>
        <div className="border-4 border-dashed border-benhur-900 rounded-2xl p-4 text-center bg-kuning-100/50">
          {form.overlay_url ? (
            <div>
              <div className="text-xs text-benhur-700 mb-2">
                Ukuran: {form.canvas_w} × {form.canvas_h} px
              </div>
              <button
                type="button"
                onClick={() => set('overlay_url', '')}
                className="text-xs font-bold text-red-600 underline"
              >
                Ganti PNG
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/png"
                onChange={onFileChange}
                disabled={uploading}
                className="hidden"
                id="overlay-input"
              />
              <label
                htmlFor="overlay-input"
                className="cursor-pointer inline-block bg-kuning-500 text-benhur-900 border-4 border-benhur-900 rounded-full px-6 py-2 font-extrabold text-sm shadow-[4px_4px_0_0_#0A1F44]"
              >
                {uploading ? 'Mengupload...' : 'Pilih PNG'}
              </label>
              <p className="text-xs text-benhur-700/70 mt-2">
                PNG dengan area transparan di tengah (lubang foto)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Slot */}
      {form.overlay_url && (
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            ATUR POSISI SLOT FOTO
          </label>
          <div className="border-4 border-benhur-900 rounded-2xl p-4 bg-white">
            <SlotEditor
              overlayUrl={form.overlay_url}
              canvasW={form.canvas_w}
              canvasH={form.canvas_h}
              slots={form.slots}
              onChange={(slots) => set('slots', slots)}
              maxSlots={10}
            />
          </div>
        </div>
      )}

      {/* Warna + urutan */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            WARNA BG
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={form.warna_bg}
              onChange={(e) => set('warna_bg', e.target.value)}
              className="w-10 h-10 rounded-xl border-4 border-benhur-900 cursor-pointer"
            />
            <input
              type="text"
              value={form.warna_bg}
              onChange={(e) => set('warna_bg', e.target.value)}
              className="flex-1 border-4 border-benhur-900 rounded-xl px-2 py-1.5 font-mono text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            WARNA AKSEN
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={form.warna_aksen}
              onChange={(e) => set('warna_aksen', e.target.value)}
              className="w-10 h-10 rounded-xl border-4 border-benhur-900 cursor-pointer"
            />
            <input
              type="text"
              value={form.warna_aksen}
              onChange={(e) => set('warna_aksen', e.target.value)}
              className="flex-1 border-4 border-benhur-900 rounded-xl px-2 py-1.5 font-mono text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            URUTAN
          </label>
          <input
            type="number"
            value={form.urutan}
            onChange={(e) => set('urutan', parseInt(e.target.value) || 0)}
            className="w-full border-4 border-benhur-900 rounded-2xl px-3 py-2 font-medium"
          />
        </div>
      </div>

      {/* Aktif */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.aktif}
          onChange={(e) => set('aktif', e.target.checked)}
          className="w-5 h-5 accent-benhur-900"
        />
        <span className="font-bold text-benhur-900 text-sm">
          Aktif (tampil di booth)
        </span>
      </label>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading
            ? 'Menyimpan...'
            : isEdit
            ? 'Simpan Perubahan'
            : 'Tambah Frame'}
        </Button>
      </div>
    </form>
  );
}