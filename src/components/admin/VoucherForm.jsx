import { useEffect, useState } from 'react';
import Button from '../Button';
import { generateKode } from '../../lib/voucher';

const EMPTY = {
  kode: '',
  tipe: 'gratis',
  nilai: 0,
  paket_id: '',
  max_usage: 1,
  expired_at: '',
  aktif: true,
  catatan: '',
};

export default function VoucherForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  paketList = [],
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [batchCount, setBatchCount] = useState(1);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        expired_at: initial.expired_at
          ? initial.expired_at.slice(0, 10)
          : '',
      });
    } else {
      setForm({ ...EMPTY, kode: generateKode() });
    }
  }, [initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.kode.trim()) return setError('Kode wajib diisi');
    if (form.tipe === 'diskon_nominal' && form.nilai <= 0)
      return setError('Nilai diskon harus lebih dari 0');
    if (form.tipe === 'diskon_persen' && (form.nilai <= 0 || form.nilai > 100))
      return setError('Diskon persen harus 1–100');
    if (form.max_usage < 1) return setError('Max usage minimal 1');

    const payload = {
      ...form,
      paket_id: form.paket_id || null,
      expired_at: form.expired_at
        ? new Date(form.expired_at + 'T23:59:59').toISOString()
        : null,
    };

    if (isEdit) {
      onSubmit(payload);
    } else {
      // Batch: buat N voucher dengan kode berbeda
      const vouchers = [];
      for (let i = 0; i < batchCount; i++) {
        vouchers.push({
          ...payload,
          kode:
            i === 0
              ? payload.kode
              : generateKode(payload.kode.split('-')[0]),
        });
      }
      onSubmit(vouchers);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Kode */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          KODE VOUCHER
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.kode}
            onChange={(e) => set('kode', e.target.value.toUpperCase())}
            disabled={isEdit}
            placeholder="PROMO-A1B2-C3D4"
            className={
              'flex-1 border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-mono font-bold tracking-wider focus:outline-none focus:ring-4 focus:ring-kuning-300 ' +
              (isEdit ? 'bg-gray-100 text-gray-500' : '')
            }
          />
          {!isEdit && (
            <button
              type="button"
              onClick={() => set('kode', generateKode())}
              className="bg-kuning-500 text-benhur-900 border-4 border-benhur-900 rounded-full px-4 py-2 font-extrabold text-xs shadow-[3px_3px_0_0_#0A1F44]"
            >
              🎲 Acak
            </button>
          )}
        </div>
      </div>

      {/* Tipe */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          TIPE
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 'gratis', label: 'Gratis', emoji: '🎁' },
            { v: 'diskon_nominal', label: 'Diskon Rp', emoji: '💰' },
            { v: 'diskon_persen', label: 'Diskon %', emoji: '📉' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => set('tipe', opt.v)}
              className={
                'border-4 border-benhur-900 rounded-2xl px-3 py-3 font-extrabold text-sm transition ' +
                (form.tipe === opt.v
                  ? 'bg-kuning-500 shadow-[4px_4px_0_0_#0A1F44]'
                  : 'bg-white hover:bg-kuning-100')
              }
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nilai (kalau bukan gratis) */}
      {form.tipe !== 'gratis' && (
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            {form.tipe === 'diskon_nominal' ? 'NILAI DISKON (Rp)' : 'DISKON (%)'}
          </label>
          <input
            type="number"
            value={form.nilai}
            onChange={(e) => set('nilai', parseInt(e.target.value) || 0)}
            min="0"
            max={form.tipe === 'diskon_persen' ? 100 : undefined}
            className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-bold focus:outline-none focus:ring-4 focus:ring-kuning-300"
          />
        </div>
      )}

      {/* Paket */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          BERLAKU UNTUK
        </label>
        <select
          value={form.paket_id || ''}
          onChange={(e) => set('paket_id', e.target.value)}
          className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
        >
          <option value="">Semua paket</option>
          {paketList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Max usage & Expired */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            MAX PEMAKAIAN
          </label>
          <input
            type="number"
            value={form.max_usage}
            onChange={(e) => set('max_usage', parseInt(e.target.value) || 1)}
            min="1"
            className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-bold focus:outline-none focus:ring-4 focus:ring-kuning-300"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            KADALUARSA
          </label>
          <input
            type="date"
            value={form.expired_at || ''}
            onChange={(e) => set('expired_at', e.target.value)}
            className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
          />
        </div>
      </div>

      {/* Batch (hanya saat tambah) */}
      {!isEdit && (
        <div>
          <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
            JUMLAH VOUCHER (BATCH)
          </label>
          <input
            type="number"
            value={batchCount}
            onChange={(e) => setBatchCount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="50"
            className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-bold focus:outline-none focus:ring-4 focus:ring-kuning-300"
          />
          <p className="text-xs text-benhur-700/60 mt-1">
            Buat 1–50 voucher sekaligus dengan kode berbeda.
          </p>
        </div>
      )}

      {/* Catatan */}
      <div>
        <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
          CATATAN (opsional)
        </label>
        <input
          type="text"
          value={form.catatan}
          onChange={(e) => set('catatan', e.target.value)}
          placeholder="mis. Promo launching"
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
          Aktif (bisa dipakai di booth)
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
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Menyimpan...'
            : isEdit
            ? 'Simpan Perubahan'
            : batchCount > 1
            ? 'Buat ' + batchCount + ' Voucher'
            : 'Tambah Voucher'}
        </Button>
      </div>
    </form>
  );
}