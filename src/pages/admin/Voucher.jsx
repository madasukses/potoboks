import { useEffect, useState } from 'react';
import Modal from '../../components/admin/Modal';
import VoucherForm from '../../components/admin/VoucherForm';
import Button from '../../components/Button';
import {
  listVoucher,
  tambahVoucher,
  tambahVoucherBatch,
  updateVoucher,
  toggleVoucherAktif,
  hapusVoucher,
} from '../../lib/voucher';

export default function Voucher() {
  const [list, setList] = useState([]);
  const [paketList, setPaketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [modalForm, setModalForm] = useState(false);
  const [modalHapus, setModalHapus] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listVoucher();
      setList(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      const { supabase } = await import('../../supabase');
      const { data } = await supabase.from('paket').select('id,nama').order('nama');
      setPaketList(data || []);
    })();
  }, []);

  const openTambah = () => {
    setEditing(null);
    setModalForm(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setModalForm(true);
  };

  const onSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await updateVoucher(editing.id, payload);
      } else if (Array.isArray(payload)) {
        await tambahVoucherBatch(payload);
      } else {
        await tambahVoucher(payload);
      }
      setModalForm(false);
      setEditing(null);
      await load();
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const onToggleAktif = async (v) => {
    try {
      await toggleVoucherAktif(v.id, !v.aktif);
      await load();
    } catch (e) {
      alert('Gagal update: ' + e.message);
    }
  };

  const onHapus = async () => {
    if (!modalHapus) return;
    setSaving(true);
    try {
      await hapusVoucher(modalHapus.id);
      setModalHapus(null);
      await load();
    } catch (e) {
      alert('Gagal hapus: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';

  const labelTipe = (v) => {
    if (v.tipe === 'gratis') return '🎁 Gratis';
    if (v.tipe === 'diskon_nominal')
      return '💰 Rp ' + v.nilai.toLocaleString('id-ID');
    if (v.tipe === 'diskon_persen') return '📉 ' + v.nilai + '%';
    return v.tipe;
  };

  const isExpired = (v) =>
    v.expired_at && new Date(v.expired_at) < new Date();
  const isHabis = (v) => v.used_count >= v.max_usage;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-benhur-900 mb-1">
            🎟 Voucher
          </h1>
          <p className="text-benhur-700/70 text-sm">
            Bikin dan kelola voucher gratis/diskon.
          </p>
        </div>
        <Button onClick={openTambah}>+ Tambah Voucher</Button>
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
            Belum ada voucher
          </h2>
          <p className="text-benhur-700 mt-2 text-sm">
            Klik "Tambah Voucher" untuk membuat voucher pertama.
          </p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="bg-white border-4 border-benhur-900 rounded-3xl shadow-[8px_8px_0_0_#0A1F44] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-benhur-100 text-benhur-700 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-extrabold">Kode</th>
                  <th className="text-left px-4 py-3 font-extrabold">Tipe</th>
                  <th className="text-left px-4 py-3 font-extrabold">Paket</th>
                  <th className="text-center px-4 py-3 font-extrabold">Dipakai</th>
                  <th className="text-center px-4 py-3 font-extrabold">
                    Kadaluarsa
                  </th>
                  <th className="text-center px-4 py-3 font-extrabold">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-extrabold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((v) => {
                  const expired = isExpired(v);
                  const habis = isHabis(v);
                  const showStatus = !v.aktif
                    ? 'nonaktif'
                    : expired
                    ? 'expired'
                    : habis
                    ? 'habis'
                    : 'aktif';
                  return (
                    <tr
                      key={v.id}
                      className="border-t-2 border-benhur-100 hover:bg-kuning-100/40"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-extrabold text-benhur-900">
                          {v.kode}
                        </div>
                        {v.catatan && (
                          <div className="text-xs text-benhur-700/60">
                            {v.catatan}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {labelTipe(v)}
                      </td>
                      <td className="px-4 py-3 text-benhur-700">
                        {v.paket_id || 'Semua paket'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {v.used_count} / {v.max_usage}
                      </td>
                      <td className="px-4 py-3 text-center text-benhur-700">
                        {fmtDate(v.expired_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            'text-[10px] font-extrabold px-2 py-1 rounded-full border-2 ' +
                            (showStatus === 'aktif'
                              ? 'bg-green-100 border-green-700 text-green-800'
                              : showStatus === 'nonaktif'
                              ? 'bg-gray-100 border-gray-500 text-gray-600'
                              : 'bg-red-100 border-red-500 text-red-700')
                          }
                        >
                          {showStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onToggleAktif(v)}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-benhur-900 bg-white hover:bg-kuning-100 transition"
                            title={v.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {v.aktif ? '🚫' : '✓'}
                          </button>
                          <button
                            onClick={() => openEdit(v)}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-benhur-900 bg-white hover:bg-kuning-100 transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setModalHapus(v)}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Hapus"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Voucher' : 'Tambah Voucher'}
        maxWidth="max-w-2xl"
      >
        <VoucherForm
          initial={editing}
          onSubmit={onSubmit}
          onCancel={() => {
            setModalForm(false);
            setEditing(null);
          }}
          loading={saving}
          paketList={paketList}
        />
      </Modal>

      <Modal
        open={Boolean(modalHapus)}
        onClose={() => setModalHapus(null)}
        title="Hapus Voucher"
        maxWidth="max-w-md"
      >
        <p className="text-benhur-700 text-sm">
          Yakin ingin menghapus voucher{' '}
          <strong className="font-mono">{modalHapus?.kode}</strong>?
        </p>
        <p className="text-red-600 text-sm mt-3 font-medium">
          Tidak bisa dikembalikan.
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="ghost"
            onClick={() => setModalHapus(null)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            onClick={onHapus}
            disabled={saving}
            className="!bg-red-500 !text-white"
          >
            {saving ? 'Menghapus...' : 'Hapus Permanen'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}