import { useEffect, useState } from 'react';
import Modal from '../../components/admin/Modal';
import PaketForm from '../../components/admin/PaketForm';
import Button from '../../components/Button';
import {
  listPaket,
  tambahPaket,
  updatePaket,
  togglePaketAktif,
  hapusPaket,
} from '../../lib/paket';

export default function Paket() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [modalForm, setModalForm] = useState(false);
  const [modalHapus, setModalHapus] = useState(null); // paket yang akan dihapus
  const [editing, setEditing] = useState(null);

  // Load data
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPaket();
      setList(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Buka modal tambah
  const openTambah = () => {
    setEditing(null);
    setModalForm(true);
  };

  // Buka modal edit
  const openEdit = (paket) => {
    setEditing(paket);
    setModalForm(true);
  };

  // Submit form (tambah / edit)
  const onSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await updatePaket(editing.id, form);
      } else {
        await tambahPaket(form);
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

  // Toggle aktif
  const onToggleAktif = async (paket) => {
    try {
      await togglePaketAktif(paket.id, !paket.aktif);
      await load();
    } catch (e) {
      alert('Gagal update: ' + e.message);
    }
  };

  // Hapus permanen
  const onHapus = async () => {
    if (!modalHapus) return;
    setSaving(true);
    try {
      await hapusPaket(modalHapus.id);
      setModalHapus(null);
      await load();
    } catch (e) {
      alert('Gagal hapus: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-benhur-900 mb-1">
            💳 Paket
          </h1>
          <p className="text-benhur-700/70 text-sm">
            Kelola paket foto: nama, harga, jumlah slot.
          </p>
        </div>
        <Button onClick={openTambah}>+ Tambah Paket</Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-benhur-700 font-bold">Memuat...</div>
      )}

      {/* Empty */}
      {!loading && list.length === 0 && (
        <div className="bg-white border-4 border-benhur-900 rounded-3xl p-10 shadow-[8px_8px_0_0_#0A1F44] text-center">
          <div className="text-5xl mb-3">📭</div>
          <h2 className="font-display text-2xl text-benhur-900">Belum ada paket</h2>
          <p className="text-benhur-700 mt-2 text-sm">
            Klik "Tambah Paket" untuk membuat paket pertama.
          </p>
        </div>
      )}

      {/* Tabel */}
      {!loading && list.length > 0 && (
        <div className="bg-white border-4 border-benhur-900 rounded-3xl shadow-[8px_8px_0_0_#0A1F44] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-benhur-100 text-benhur-700 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-extrabold">Nama</th>
                  <th className="text-left px-4 py-3 font-extrabold">ID</th>
                  <th className="text-right px-4 py-3 font-extrabold">Harga</th>
                  <th className="text-center px-4 py-3 font-extrabold">Slot</th>
                  <th className="text-center px-4 py-3 font-extrabold">Status</th>
                  <th className="text-right px-4 py-3 font-extrabold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-t-2 border-benhur-100 hover:bg-kuning-100/40">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-benhur-900">{p.nama}</div>
                      {p.deskripsi && (
                        <div className="text-xs text-benhur-700/70 mt-0.5">{p.deskripsi}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-benhur-100 px-2 py-1 rounded">
                        {p.id}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-benhur-900">
                      Rp {p.harga.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{p.slot}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onToggleAktif(p)}
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border-2 transition ${
                          p.aktif
                            ? 'bg-green-100 border-green-700 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 border-gray-500 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p.aktif ? '✓ AKTIF' : '✗ NONAKTIF'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-benhur-900 bg-white hover:bg-kuning-100 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setModalHapus(p)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          🗑 Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <Modal
        open={modalForm}
        onClose={() => { setModalForm(false); setEditing(null); }}
        title={editing ? 'Edit Paket' : 'Tambah Paket'}
      >
        <PaketForm
          initial={editing}
          onSubmit={onSubmit}
          onCancel={() => { setModalForm(false); setEditing(null); }}
          loading={saving}
        />
      </Modal>

      {/* Modal Hapus */}
      <Modal
        open={Boolean(modalHapus)}
        onClose={() => setModalHapus(null)}
        title="Hapus Paket"
        maxWidth="max-w-md"
      >
        <p className="text-benhur-700 text-sm">
          Yakin ingin menghapus paket <strong>{modalHapus?.nama}</strong> secara permanen?
        </p>
        <p className="text-red-600 text-sm mt-3 font-medium">
          ⚠️ Tindakan ini tidak bisa dibatalkan. Sesi foto lama yang memakai paket ini
          tetap aman (data paket tersimpan di sesi).
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" onClick={() => setModalHapus(null)} disabled={saving}>
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