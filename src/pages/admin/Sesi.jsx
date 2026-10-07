import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/admin/Modal';
import PreviewSesi from '../../components/admin/PreviewSesi';
import Button from '../../components/Button';
import { downloadSesi, hapusSesiPermanen, getStatistik } from '../../lib/download';
import { listSesi } from '../../lib/sesi';

export default function Sesi() {
  const nav = useNavigate();

  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [paketFilter, setPaketFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paketList, setPaketList] = useState([]);

  const [selected, setSelected] = useState(new Set());
  const [modalHapus, setModalHapus] = useState(null);
  const [hapusTarget, setHapusTarget] = useState(null);
  const [konfirmasi, setKonfirmasi] = useState('');
  const [previewTarget, setPreviewTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, stat] = await Promise.all([
        listSesi({ search, paketId: paketFilter, status: statusFilter }),
        getStatistik(),
      ]);
      setList(data);
      setStats(stat);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, paketFilter, statusFilter]);

  useEffect(() => {
    (async () => {
      const { supabase } = await import('../../supabase');
      const { data } = await supabase
        .from('paket')
        .select('id,nama')
        .order('nama');
      setPaketList(data || []);
    })();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === list.length) setSelected(new Set());
    else setSelected(new Set(list.map((s) => s.id)));
  };

  const onDownloadOne = async (session) => {
    try {
      setWorking(true);
      await downloadSesi(session);
    } catch (e) {
      alert('Gagal download: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  const onDownloadBulk = async () => {
    const items = list.filter((s) => selected.has(s.id));
    if (!items.length) return;
    if (!confirm('Download ' + items.length + ' sesi sebagai ZIP terpisah?'))
      return;
    setWorking(true);
    try {
      for (const s of items) {
        await downloadSesi(s);
        await new Promise((r) => setTimeout(r, 400));
      }
    } catch (e) {
      alert('Sebagian gagal: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  const openHapusOne = (session) => {
    setHapusTarget(session);
    setKonfirmasi('');
    setModalHapus('single');
  };

  const openHapusBulk = () => {
    if (!selected.size) return;
    setHapusTarget(null);
    setKonfirmasi('');
    setModalHapus('bulk');
  };

  const konfirmasiHapus = async () => {
    setWorking(true);
    try {
      if (modalHapus === 'single' && hapusTarget) {
        await hapusSesiPermanen(hapusTarget);
      } else {
        const items = list.filter((s) => selected.has(s.id));
        for (const s of items) await hapusSesiPermanen(s);
      }
      setModalHapus(null);
      setHapusTarget(null);
      setSelected(new Set());
      await load();
    } catch (e) {
      alert('Gagal hapus: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  const fmtRp = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');
  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  const fmtSize = (mb) =>
    mb < 1024 ? mb.toFixed(1) + ' MB' : (mb / 1024).toFixed(2) + ' GB';

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-benhur-900 mb-1">
          📸 Histori Sesi
        </h1>
        <p className="text-benhur-700/70 text-sm">
          Semua sesi foto yang pernah terjadi di booth.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="TOTAL SESI" value={stats.totalSesi} suffix="sesi" />
          <StatCard label="HARI INI" value={stats.sesiHariIni} suffix="sesi" />
          <StatCard
            label="OMZET BULAN INI"
            value={fmtRp(stats.omzetBulanIni)}
          />
          <StatCard
            label="FOTO TERSIMPAN"
            value={stats.totalFoto}
            suffix={'≈ ' + fmtSize(stats.storagePerkiraan)}
          />
        </div>
      )}

      <div className="bg-white border-4 border-benhur-900 rounded-3xl shadow-[6px_6px_0_0_#0A1F44] overflow-hidden">
        <div className="p-4 border-b-4 border-benhur-900 bg-kuning-100 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Cari slug / paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] border-4 border-benhur-900 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
          />
          <select
            value={paketFilter}
            onChange={(e) => setPaketFilter(e.target.value)}
            className="border-4 border-benhur-900 rounded-xl px-3 py-2 text-sm font-bold bg-white"
          >
            <option value="">Semua paket</option>
            {paketList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch('');
              setPaketFilter('');
              setStatusFilter('');
            }}
            className="text-xs font-bold text-benhur-700 underline"
          >
            Reset filter
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm border-b-4 border-benhur-900">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-benhur-700 font-bold">
            Memuat...
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📭</div>
            <div className="font-bold text-benhur-900">Belum ada sesi</div>
            <p className="text-benhur-700/70 text-sm mt-1">
              Sesi akan muncul di sini setelah tamu selesai foto.
            </p>
          </div>
        )}

        {!loading && list.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-benhur-100 text-benhur-700 text-xs uppercase tracking-wider">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selected.size === list.length && list.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-5 h-5 accent-benhur-900"
                    />
                  </th>
                  <th className="text-left px-3 py-3 font-extrabold">Slug</th>
                  <th className="text-left px-3 py-3 font-extrabold">Waktu</th>
                  <th className="text-left px-3 py-3 font-extrabold">Paket</th>
                  <th className="text-center px-3 py-3 font-extrabold">Foto</th>
                  <th className="text-right px-3 py-3 font-extrabold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t-2 border-benhur-100 hover:bg-kuning-100/40"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        className="w-5 h-5 accent-benhur-900"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => nav('/admin/sesi/' + s.id)}
                        className="font-mono font-bold text-benhur-700 hover:text-benhur-900 underline"
                      >
                        {s.slug}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-benhur-700">
                      {fmtDate(s.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-benhur-900">
                        {s.paket_nama}
                      </div>
                      <div className="text-xs text-benhur-700/60">
                        {fmtRp(s.harga)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold">
                      {s.photo_count} / {s.slot_count}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewTarget(s)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-benhur-900 bg-white hover:bg-kuning-100 transition"
                          title="Preview"
                        >
                          👁
                        </button>
                        <button
                          onClick={() => onDownloadOne(s)}
                          disabled={working}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-benhur-900 bg-white hover:bg-kuning-100 transition disabled:opacity-30"
                          title="Download ZIP"
                        >
                          ⬇
                        </button>
                        <button
                          onClick={() => openHapusOne(s)}
                          disabled={working}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-30"
                          title="Hapus permanen"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-benhur-900 text-white rounded-full px-6 py-3 shadow-[6px_6px_0_0_rgba(0,0,0,0.3)] flex items-center gap-4">
          <span className="text-sm">
            <strong className="text-kuning-300">{selected.size}</strong> dipilih
          </span>
          <button
            onClick={onDownloadBulk}
            disabled={working}
            className="bg-kuning-500 text-benhur-900 border-2 border-benhur-900 rounded-full px-4 py-1.5 text-xs font-extrabold disabled:opacity-50"
          >
            ⬇ Download
          </button>
          <button
            onClick={openHapusBulk}
            disabled={working}
            className="bg-red-500 text-white border-2 border-benhur-900 rounded-full px-4 py-1.5 text-xs font-extrabold disabled:opacity-50"
          >
            🗑 Hapus
          </button>
        </div>
      )}

      <PreviewSesi
        session={previewTarget}
        onClose={() => setPreviewTarget(null)}
        onDownload={onDownloadOne}
        working={working}
      />

      <Modal
        open={Boolean(modalHapus)}
        onClose={() => {
          if (!working) setModalHapus(null);
        }}
        title="Hapus Permanen"
        maxWidth="max-w-md"
      >
        {modalHapus === 'single' && hapusTarget && (
          <>
            <p className="text-benhur-700 text-sm">
              Yakin ingin <strong>menghapus permanen</strong> sesi{' '}
              <strong className="font-mono">{hapusTarget.slug}</strong>?
            </p>
            <p className="text-red-600 text-sm mt-3 font-medium">
              File di storage dan data sesi akan dihapus. Tidak bisa
              dikembalikan.
            </p>
          </>
        )}
        {modalHapus === 'bulk' && (
          <>
            <p className="text-benhur-700 text-sm">
              Yakin ingin menghapus permanen{' '}
              <strong>{selected.size} sesi</strong> terpilih?
            </p>
            <p className="text-red-600 text-sm mt-3 font-medium">
              File di storage dan data sesi akan dihapus. Tidak bisa
              dikembalikan.
            </p>
            <div className="mt-4">
              <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
                KETIK HAPUS UNTUK KONFIRMASI
              </label>
              <input
                type="text"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value.toUpperCase())}
                placeholder="HAPUS"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-extrabold tracking-widest text-center focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
            </div>
          </>
        )}
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="ghost"
            onClick={() => setModalHapus(null)}
            disabled={working}
          >
            Batal
          </Button>
          <Button
            onClick={konfirmasiHapus}
            disabled={
              working || (modalHapus === 'bulk' && konfirmasi !== 'HAPUS')
            }
            className="!bg-red-500 !text-white"
          >
            {working ? 'Menghapus...' : 'Hapus Permanen'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, suffix }) {
  return (
    <div className="bg-white border-4 border-benhur-900 rounded-2xl p-4 shadow-[4px_4px_0_0_#0A1F44]">
      <div className="text-[10px] font-extrabold tracking-widest text-benhur-700/70">
        {label}
      </div>
      <div className="text-2xl font-extrabold text-benhur-900 mt-1 leading-none">
        {value}
      </div>
      {suffix && (
        <div className="text-xs font-bold text-benhur-700/60 mt-1">
          {suffix}
        </div>
      )}
    </div>
  );
}