import { useEffect, useState } from 'react';
import Button from '../Button';
import { generatePaketId } from '../../lib/paket';

const EMPTY = {
  id: '',
  nama: '',
  harga: 0,
  slot: 4,
  deskripsi: '',
  catatan: '',
  aktif: true,
};

export default function PaketForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const isEdit = Boolean(initial?.id);

  // Isi form kalau edit
  useEffect(() => {
    if (initial) setForm({ ...EMPTY, ...initial });
    else setForm(EMPTY);
  }, [initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-generate ID dari nama (hanya saat tambah baru)
  const onNamaChange = (v) => {
    set('nama', v);
    if (!isEdit) set('id', generatePaketId(v));
  };

  const submit = (e) => {
    e.preventDefault();
    setError(null);

    // Validasi
    if (!form.nama.trim()) return setError('Nama paket wajib diisi');
    if (!isEdit && !form.id.trim()) return setError('ID paket tidak valid');
    if (form.harga < 0) return setError('Harga tidak boleh negatif');
    if (form.slot < 1) return setError('Jumlah slot minimal 1');

    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Nama */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          NAMA PAKET
        </label>
        <input
          type="text"
          value={form.nama}
          onChange={(e) => onNamaChange(e.target.value)}
          placeholder="mis. Pop Snap"
          className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
        />
      </div>

      {/* ID (readonly saat edit) */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          ID (SLUG)
        </label>
        <input
          type="text"
          value={form.id}
          onChange={(e) => set('id', e.target.value)}
          disabled={isEdit}
          className={`w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-kuning-300 ${
            isEdit ? 'bg-gray-100 text-gray-500' : ''
          }`}
        />
        <p className="text-xs text-benhur-700/60 mt-1">
          {isEdit ? 'ID tidak bisa diubah setelah dibuat.' : 'Otomatis dari nama, bisa diubah manual.'}
        </p>
      </div>

      {/* Harga & Slot */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            HARGA (Rp)
          </label>
          <input
            type="number"
            value={form.harga}
            onChange={(e) => set('harga', parseInt(e.target.value) || 0)}
            min="0"
            step="1000"
            className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            JUMLAH SLOT
          </label>
          <select
            value={form.slot}
            onChange={(e) => set('slot', parseInt(e.target.value))}
            className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
          >
            <option value={2}>2 slot</option>
            <option value={4}>4 slot</option>
            <option value={6}>6 slot</option>
          </select>
        </div>
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          DESKRIPSI
        </label>
        <input
          type="text"
          value={form.deskripsi}
          onChange={(e) => set('deskripsi', e.target.value)}
          placeholder="mis. 1 cetakan + semua softfile"
          className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
        />
      </div>

      {/* Catatan */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          CATATAN
        </label>
        <input
          type="text"
          value={form.catatan}
          onChange={(e) => set('catatan', e.target.value)}
          placeholder="mis. 1 cetakan termasuk · extra Rp 5.000/cetak"
          className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
        />
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Paket'}
        </Button>
      </div>
    </form>
  );
}