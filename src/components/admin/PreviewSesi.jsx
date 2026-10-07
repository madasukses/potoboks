import { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from '../Button';
import { getSesiDetail } from '../../lib/sesi';

export default function PreviewSesi({ session, onClose, onDownload, working }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    getSesiDetail(session.id)
      .then(setDetail)
      .catch((e) => alert('Gagal memuat: ' + e.message))
      .finally(() => setLoading(false));
  }, [session]);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Modal
      open={Boolean(session)}
      onClose={onClose}
      title={`Preview — ${session?.slug || ''}`}
      maxWidth="max-w-4xl"
    >
      {loading && (
        <div className="text-center py-12 text-benhur-700 font-bold">
          Memuat foto...
        </div>
      )}

      {!loading && detail && (
        <div className="grid md:grid-cols-[1fr_240px] gap-5">
          {/* KIRI: foto */}
          <div className="space-y-4">
            {detail.session.final_image_url && !detail.session.photos_cleared ? (
              <div>
                <div className="text-xs font-extrabold tracking-widest text-benhur-700/70 mb-2">
                  HASIL FINAL
                </div>
                <img
                  src={detail.session.final_image_url}
                  alt="Final"
                  className="w-full rounded-2xl border-2 border-benhur-900/20"
                />
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-2">🗄</div>
                <div className="font-bold text-gray-600 text-sm">
                  Foto sudah direset
                </div>
              </div>
            )}

            {detail.photos.length > 0 && (
              <div>
                <div className="text-xs font-extrabold tracking-widest text-benhur-700/70 mb-2">
                  FOTO MENTAH ({detail.photos.length})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {detail.photos.map((p) => (
                    <a
                      key={p.id}
                      href={p.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg overflow-hidden border-2 border-benhur-900/20 hover:border-benhur-900 transition"
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
          </div>

          {/* KANAN: info + aksi */}
          <div className="space-y-3">
            <div className="bg-kuning-100 border-2 border-benhur-900 rounded-2xl p-3 text-sm">
              <InfoRow label="Paket" value={detail.session.paket_nama} />
              <InfoRow
                label="Harga"
                value={`Rp ${(detail.session.harga || 0).toLocaleString('id-ID')}`}
              />
              <InfoRow label="Frame" value={detail.session.frame_id} mono />
              <InfoRow label="Slot" value={detail.session.slot_count} />
              <InfoRow label="Waktu" value={fmtDate(detail.session.created_at)} />
              <InfoRow
                label="Status"
                value={detail.session.photos_cleared ? 'ARCHIVED' : 'LIVE'}
              />
            </div>

            <a
              href={`/r/${detail.session.slug}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center btn-sticker bg-white text-benhur-900 text-sm !py-2"
            >
              🌐 Buka Halaman Publik
            </a>

            <Button
              onClick={() => onDownload(detail.session)}
              disabled={working || detail.session.photos_cleared}
              className="w-full text-sm !py-2"
            >
              ⬇ Download ZIP
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-2 py-1 border-b border-benhur-900/10 last:border-0">
      <span className="text-benhur-700/70 text-xs font-medium">{label}</span>
      <span
        className={`font-bold text-benhur-900 text-xs text-right ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}