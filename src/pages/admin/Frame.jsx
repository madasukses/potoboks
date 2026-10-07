import { useEffect, useState } from 'react';
import Modal from '../../components/admin/Modal';
import FrameForm from '../../components/admin/FrameForm';
import Button from '../../components/Button';
import {
  listFrame,
  tambahFrame,
  updateFrame,
  toggleFrameAktif,
  hapusFrame,
  uploadOverlay,
} from '../../lib/frame';

export default function Frame() {
  const [list, setList] = useState([]);
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
      const data = await listFrame();
      setList(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openTambah = () => {
    setEditing(null);
    setModalForm(true);
  };

  const openEdit = (frame) => {
    setEditing(frame);
    setModalForm(true);
  };

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await updateFrame(editing.id, form);
      } else {
        await tambahFrame(form);
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

  const onToggleAktif = async (frame) => {
    try {
      await toggleFrameAktif(frame.id, !frame.aktif);
      await load();
    } catch (e) {
      alert('Gagal update: ' + e.message);
    }
  };

  const onHapus = async () => {
    if (!modalHapus) return;
    setSaving(true);
    try {
      await hapusFrame(modalHapus.id);
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
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-benhur-900 mb-1">
            🖼 Frame
          </h1>
          <p className="text-benhur-700/70 text-sm">
            Kelola frame: upload PNG overlay, atur slot, aktif/nonaktif.
          </p>
        </div>
        <Button onClick={openTambah}>+ Tambah Frame</Button>
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
            Belum ada frame
          </h2>
          <p className="text-benhur-700 mt-2 text-sm">
            Klik "Tambah Frame" untuk membuat frame pertama.
          </p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {list.map((f) => (
            <div
              key={f.id}
              className="bg-white border-4 border-benhur-900 rounded-2xl shadow-[6px_6px_0_0_#0A1F44] overflow-hidden flex flex-col"
            >
              <div
                className="aspect-[2/3] relative overflow-hidden"
                style={{ background: f.warna_bg }}
              >
                {f.overlay_url ? (
                  <img
                    src={f.overlay_url}
                    alt={f.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col gap-1.5 p-3">
                    {Array.from({ length: Math.min(f.slot_count, 4) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded bg-white/50 border border-benhur-900/20"
                        />
                      )
                    )}
                  </div>
                )}

                {!f.aktif && (
                  <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] font-extrabold px-2 py-1 rounded">
                    NONAKTIF
                  </div>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <div className="font-extrabold text-benhur-900 text-sm">
                  {f.nama}
                </div>
                <div className="text-xs text-benhur-700/60 mb-2">
                  {f.slot_count} slot · urutan {f.urutan}
                </div>

                <div className="flex gap-1 mt-auto">
                  <button
                    onClick={() => onToggleAktif(f)}
                    className={
                      'text-[10px] font-extrabold px-2 py-1 rounded-full border-2 transition flex-1 ' +
                      (f.aktif
                        ? 'bg-green-100 border-green-700 text-green-800'
                        : 'bg-gray-100 border-gray-500 text-gray-600')
                    }
                  >
                    {f.aktif ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                  <button
                    onClick={() => openEdit(f)}
                    className="text-xs font-bold px-2 py-1 rounded-lg border-2 border-benhur-900 bg-white hover:bg-kuning-100 transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setModalHapus(f)}
                    className="text-xs font-bold px-2 py-1 rounded-lg border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Hapus"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDIT — maxWidth diperlebar */}
      <Modal
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Frame' : 'Tambah Frame'}
        maxWidth="max-w-6xl"
      >
        <FrameForm
          initial={editing}
          onSubmit={onSubmit}
          onCancel={() => {
            setModalForm(false);
            setEditing(null);
          }}
          loading={saving}
          onUploadOverlay={uploadOverlay}
        />
      </Modal>

      <Modal
        open={Boolean(modalHapus)}
        onClose={() => setModalHapus(null)}
        title="Hapus Frame"
        maxWidth="max-w-md"
      >
        <p className="text-benhur-700 text-sm">
          Yakin ingin menghapus frame <strong>{modalHapus?.nama}</strong>{' '}
          secara permanen?
        </p>
        <p className="text-red-600 text-sm mt-3 font-medium">
          File PNG overlay di storage juga akan dihapus.
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