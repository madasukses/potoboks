import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../../components/admin/Modal';
import Button from '../../components/Button';
import { getSesiDetail } from '../../lib/sesi';
import { downloadSesi, resetSesi } from '../../lib/download';

export default function SesiDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [session, setSession] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(false);
  const [modalReset, setModalReset] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSesiDetail(id);
      setSession(res.session);
      setPhotos(res.photos);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const onDownload = async () => {
    try {
      setWorking(true);
      await downloadSesi(session);
    } catch (e) {
      alert('Gagal download: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  const onReset = async () => {
    setWorking(true);
    try {
      await resetSesi(session);
      setModalReset(false);
      await load();
    } catch (e) {
      alert('Gagal reset: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  const fmtRp = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');
  const fmtDate = (iso) => new Date(iso).toLocaleString('id-ID');

  if (loading) {
    return (
      <div className="text-center py-12 text-benhur-700 font-bold">
        Memuat...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">❌</div>
        <div className="font-bold text-benhur-900">Sesi tidak ditemukan</div>
        <button
          onClick={() => nav('/admin/sesi')}
          className="mt-4 text-benhur-700 underline font-bold text-sm"
        >
          ← Kembali ke daftar sesi
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <button
            onClick={() => nav('/admin/sesi')}
            className="text-sm font-bold text-benhur-700 hover:text-benhur-900 mb-2"
          >
            ← Kembali
          </button>
          <h1 className="font-display text-3xl text-benhur-900 mb-1">
            Sesi <span className="font-mono">{session.slug}</span>
          </h1>
          <p className="text-benhur-700/70 text-sm">{fmtDate(session.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onDownload} disabled={working || session.photos_cleared}>
            ⬇ Download ZIP
          </Button>
          <Button
            variant="secondary"
            onClick={() => setModalReset(true)}
            disabled={working || session.photos_cleared}
            className="!bg-red-500 !text-white"
          >
            🗑 Reset
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Kiri: foto */}
        <div className="space-y-4">
          {session.final_image_url && !session.photos_cleared && (
            <div className="bg-white border-4 border-benhur-900 rounded-3xl p-4 shadow-[6px_6px_0_0_#0A1F44]">
              <h2 className="font-extrabold text-benhur-900 mb-3">Hasil Final</h2>
              <img
                src={session.final_image_url}
                alt="Final"
                className="w-full rounded-2xl"
              />
            </div>
          )}

          {photos.length > 0 && (
            <div className="bg-white border-4 border-benhur-900 rounded-3xl p-4 shadow-[6px_6px_0_0_#0A1F44]">
              <h2 className="font-extrabold text-benhur-900 mb-3">
                Foto Mentah ({photos.length})
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl overflow-hidden border-2 border-benhur-900/20 hover:border-benhur-900 transition"
                  >
                    <img
                      src={p.photo_url}
                      alt={`Foto ${p.slot_index + 1}`}
                      className="w-full"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {session.photos_cleared && (
            <div className="bg-white border-4 border-benhur-900 rounded-3xl p-8 shadow-[6px_6px_0_0_#0A1F44] text-center">
              <div className="text-5xl mb-3">🗄</div>
              <h2 className="font-display text-xl text-benhur-900">
                Foto sudah direset
              </h2>
              <p className="text-benhur-700 text-sm mt-2">
                File di storage sudah dihapus. Histori sesi tetap tersimpan.
              </p>
            </div>
          )}
        </div>

        {/* Kanan: info */}
        <div className="space-y-4">
          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-5 shadow-[6px_6px_0_0_#0A1F44]">
            <h2 className="font-extrabold text-benhur-900 mb-3">Info Sesi</h2>
            <dl className="space-y-1">
              <InfoRow label="Slug" value={session.slug} mono />
              <InfoRow label="Paket" value={session.paket_nama} />
              <InfoRow label="Harga" value={fmtRp(session.harga)} />
              <InfoRow label="Frame" value={session.frame_id} mono />
              <InfoRow label="Slot" value={session.slot_count} />
              <InfoRow label="Retake sisa" value={session.retake_left} />
              <InfoRow
                label="Status"
                value={session.photos_cleared ? 'ARCHIVED' : 'LIVE'}
              />
            </dl>
          </div>

          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-5 shadow-[6px_6px_0_0_#0A1F44]">
            <h2 className="font-extrabold text-benhur-900 mb-3">Halaman Publik</h2>
            <div className="text-xs font-mono text-benhur-700 break-all mb-3">
              {window.location.origin}/r/{session.slug}
            </div>
            <a
              href={`/r/${session.slug}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center btn-sticker bg-kuning-500 text-benhur-900 text-sm !py-2"
            >
              Buka Halaman
            </a>
          </div>
        </div>
      </div>

      {/* Modal Reset */}
      <Modal
        open={modalReset}
        onClose={() => setModalReset(false)}
        title="Reset Foto"
        maxWidth="max-w-md"
      >
        <p className="text-benhur-700 text-sm">
          Yakin ingin mereset foto dari sesi ini?
        </p>
        <p className="text-red-600 text-sm mt-3 font-medium">
          ⚠️ File di storage akan dihapus permanen. Histori sesi tetap tersimpan.
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="ghost"
            onClick={() => setModalReset(false)}
            disabled={working}
          >
            Batal
          </Button>
          <Button
            onClick={onReset}
            disabled={working}
            className="!bg-red-500 !text-white"
          >
            {working ? 'Memproses...' : 'Reset Foto'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-benhur-100 last:border-0">
      <dt className="text-benhur-700/70 font-medium text-sm">{label}</dt>
      <dd
        className={`font-bold text-benhur-900 text-right text-sm ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}