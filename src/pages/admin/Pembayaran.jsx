import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import {
  listPayments,
  updatePaymentStatus,
} from '../../lib/payment';

export default function Pembayaran() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPayments({ status: filter });
      setList(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Auto refresh tiap 5 detik kalau lagi lihat pending
  useEffect(() => {
    if (filter !== 'pending') return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const onApprove = async (pay) => {
    if (!confirm('Konfirmasi pembayaran ini sudah diterima?')) return;
    setWorking(true);
    try {
      await updatePaymentStatus(pay.id, 'paid');
      await load();
    } catch (e) {
      alert('Gagal approve: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  const onTolak = async (pay) => {
    if (!confirm('Tolak pembayaran ini?')) return;
    setWorking(true);
    try {
      await updatePaymentStatus(pay.id, 'failed');
      await load();
    } catch (e) {
      alert('Gagal tolak: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  const fmtRp = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');
  const fmtTime = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const metodeLabel = (m) => {
    if (m === 'qris') return '💳 QRIS';
    if (m === 'tunai') return '💵 Tunai';
    if (m === 'voucher') return '🎁 Voucher';
    if (m === 'gratis') return '🎁 Gratis';
    return m;
  };

  const statusBadge = (s) => {
    const map = {
      pending: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      paid: 'bg-green-100 border-green-700 text-green-800',
      failed: 'bg-red-100 border-red-500 text-red-700',
      expired: 'bg-gray-100 border-gray-500 text-gray-600',
    };
    return map[s] || 'bg-gray-100 border-gray-500 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-benhur-900 mb-1">
            💰 Pembayaran
          </h1>
          <p className="text-benhur-700/70 text-sm">
            Konfirmasi pembayaran dari tamu booth.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-1 bg-white border-4 border-benhur-900 rounded-full p-1 shadow-[4px_4px_0_0_#0A1F44]">
          {[
            { v: 'pending', label: 'Menunggu' },
            { v: 'paid', label: 'Lunas' },
            { v: 'failed', label: 'Gagal' },
            { v: '', label: 'Semua' },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setFilter(opt.v)}
              className={
                'px-4 py-1.5 rounded-full text-xs font-extrabold transition ' +
                (filter === opt.v
                  ? 'bg-kuning-500 text-benhur-900'
                  : 'text-benhur-700 hover:bg-kuning-100')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-benhur-700 font-bold">
          Memuat...
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="bg-white border-4 border-benhur-900 rounded-3xl p-10 shadow-[8px_8px_0_0_#0A1F44] text-center">
          <div className="text-5xl mb-3">📭</div>
          <h2 className="font-display text-2xl text-benhur-900">
            Tidak ada pembayaran
          </h2>
          <p className="text-benhur-700 mt-2 text-sm">
            Pembayaran baru akan muncul di sini.
          </p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="grid gap-3">
          {list.map((p) => (
            <div
              key={p.id}
              className="bg-white border-4 border-benhur-900 rounded-2xl p-4 shadow-[4px_4px_0_0_#0A1F44] flex flex-wrap items-center gap-4"
            >
              {/* Kode Sesi */}
              <div className="shrink-0">
                <div className="text-[10px] font-bold tracking-widest text-benhur-700/70">
                  KODE SESI
                </div>
                <div className="font-mono font-extrabold text-benhur-900 text-lg">
                  {p.session_id.slice(0, 8).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-[180px]">
                <div className="font-extrabold text-benhur-900">
                  {p.sessions?.paket_nama || '—'}
                </div>
                <div className="text-xs text-benhur-700/70">
                  {fmtTime(p.created_at)} · {metodeLabel(p.metode)}
                  {p.voucher_kode && (
                    <span className="ml-1 text-green-700">
                      · {p.voucher_kode}
                    </span>
                  )}
                </div>
              </div>

              {/* Jumlah */}
              <div className="text-right">
                <div className="font-extrabold text-benhur-900 text-lg">
                  {fmtRp(p.jumlah_bayar)}
                </div>
                {p.jumlah_bayar < p.jumlah_asli && (
                  <div className="text-xs text-benhur-700/60 line-through">
                    {fmtRp(p.jumlah_asli)}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="shrink-0">
                <span
                  className={
                    'text-[10px] font-extrabold px-3 py-1.5 rounded-full border-2 ' +
                    statusBadge(p.status)
                  }
                >
                  {p.status.toUpperCase()}
                </span>
              </div>

              {/* Aksi */}
              {p.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => onApprove(p)}
                    disabled={working}
                    className="!px-4 !py-2 text-sm"
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    onClick={() => onTolak(p)}
                    disabled={working}
                    variant="ghost"
                    className="!px-4 !py-2 text-sm !border-red-500 !text-red-600"
                  >
                    ✕ Tolak
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}