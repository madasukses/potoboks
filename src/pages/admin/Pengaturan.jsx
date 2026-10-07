import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Modal from '../../components/admin/Modal';
import {
  getSettings,
  updateSettings,
  uploadLogo,
  resetEvent,
} from '../../lib/settings';
import { listFrame } from '../../lib/frame';

export default function Pengaturan() {
  const [form, setForm] = useState(null);
  const [frameList, setFrameList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [modalReset, setModalReset] = useState(false);
  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settings, frames] = await Promise.all([
        getSettings(),
        listFrame(),
      ]);
      setForm(settings || {});
      setFrameList(frames.filter((f) => f.aktif));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      set('logo_url', url);
    } catch (err) {
      setError('Gagal upload logo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateSettings(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onResetEvent = async () => {
    setWorking(true);
    try {
      await resetEvent();
      setModalReset(false);
      await load();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Gagal reset event: ' + e.message);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-benhur-700 font-bold">
        Memuat...
      </div>
    );
  }

  if (!form) return null;

  // Preview slug
  const previewSlug = form.nama_event
    ? form.nama_event
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30) + '-001'
    : 'potoboks001';

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-benhur-900 mb-1">
          ⚙️ Pengaturan
        </h1>
        <p className="text-benhur-700/70 text-sm">
          Identitas bisnis, branding, event, dan preferensi default.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-3 text-sm text-green-700 font-medium mb-4">
          ✓ Berhasil disimpan
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        {/* EVENT */}
        <Section title="🎉 Nama Event (Opsional)">
          <p className="text-sm text-benhur-700 -mt-2 mb-2">
            Isi untuk ganti prefix slug dari <code>potoboks001</code> menjadi
            nama event, misal <code>budi-wedding-001</code>.
          </p>
          <Field label="NAMA EVENT">
            <input
              type="text"
              value={form.nama_event || ''}
              onChange={(e) => set('nama_event', e.target.value)}
              placeholder="contoh: budi-wedding-2026"
              className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
            />
          </Field>

          <div className="bg-kuning-100 border-2 border-benhur-900/20 rounded-2xl p-4 text-sm">
            <div className="font-bold text-benhur-700/70 text-xs tracking-widest mb-1">
              PREVIEW SLUG BERIKUTNYA
            </div>
            <div className="font-mono font-extrabold text-benhur-900 text-lg">
              {previewSlug}
            </div>
            <div className="text-xs text-benhur-700/60 mt-1">
              Sesi berikutnya akan memakai slug ini
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setModalReset(true)}
              className="text-xs font-bold text-red-600 underline"
            >
              🔄 Reset Event (kembali ke potoboks)
            </button>
          </div>
        </Section>

        {/* IDENTITAS */}
        <Section title="🏢 Identitas Bisnis">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="NAMA BISNIS">
              <input
                type="text"
                value={form.nama_bisnis || ''}
                onChange={(e) => set('nama_bisnis', e.target.value)}
                placeholder="potoboks"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
            </Field>
            <Field label="ALAMAT HALAMAN PUBLIK">
              <div className="flex items-center border-4 border-benhur-900 rounded-2xl overflow-hidden">
                <span className="bg-benhur-100 px-3 py-2.5 text-sm text-benhur-700/70 font-mono">
                  /p/
                </span>
                <input
                  type="text"
                  value={form.alamat_publik || ''}
                  onChange={(e) =>
                    set(
                      'alamat_publik',
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '')
                    )
                  }
                  placeholder="potoboks-studio"
                  className="flex-1 px-4 py-2.5 font-mono text-sm focus:outline-none"
                />
              </div>
            </Field>
          </div>

          <Field label="TAGLINE">
            <input
              type="text"
              value={form.tagline || ''}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="capture moments, create memories"
              className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
            />
          </Field>

          <Field label="LOGO">
            <div className="border-4 border-dashed border-benhur-900 rounded-2xl p-4 text-center bg-kuning-100/50">
              {form.logo_url ? (
                <div>
                  <img
                    src={form.logo_url}
                    alt="Logo"
                    className="max-h-24 mx-auto mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => set('logo_url', '')}
                    className="text-xs font-bold text-red-600 underline"
                  >
                    Hapus logo
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onLogoChange}
                    disabled={uploading}
                    className="hidden"
                    id="logo-input"
                  />
                  <label
                    htmlFor="logo-input"
                    className="cursor-pointer inline-block bg-kuning-500 text-benhur-900 border-4 border-benhur-900 rounded-full px-6 py-2 font-extrabold text-sm shadow-[4px_4px_0_0_#0A1F44]"
                  >
                    {uploading ? 'Mengupload...' : 'Pilih Logo'}
                  </label>
                  <p className="text-xs text-benhur-700/70 mt-2">
                    PNG / JPG, maksimal 500KB
                  </p>
                </div>
              )}
            </div>
          </Field>
        </Section>

        {/* KONTAK */}
        <Section title="📞 Kontak & Sosial Media">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="WHATSAPP">
              <input
                type="text"
                value={form.whatsapp || ''}
                onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="0812 3456 7890"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
            </Field>
            <Field label="INSTAGRAM">
              <input
                type="text"
                value={form.instagram || ''}
                onChange={(e) => set('instagram', e.target.value)}
                placeholder="@potoboks"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
            </Field>
            <Field label="TIKTOK">
              <input
                type="text"
                value={form.tiktok || ''}
                onChange={(e) => set('tiktok', e.target.value)}
                placeholder="@potoboks"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
            </Field>
          </div>
        </Section>

        {/* PREFERENSI */}
        <Section title="🎨 Preferensi Default">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="WARNA AKSEN">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.warna_aksen || '#FFC93C'}
                  onChange={(e) => set('warna_aksen', e.target.value)}
                  className="w-12 h-12 rounded-xl border-4 border-benhur-900 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.warna_aksen || '#FFC93C'}
                  onChange={(e) => set('warna_aksen', e.target.value)}
                  className="flex-1 border-4 border-benhur-900 rounded-2xl px-3 py-2 font-mono text-sm"
                />
              </div>
            </Field>

            <Field label="FRAME DEFAULT">
              <select
                value={form.frame_default_id || ''}
                onChange={(e) =>
                  set('frame_default_id', e.target.value || null)
                }
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
              >
                <option value="">— Frame pertama yang aktif —</option>
                {frameList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nama}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="TIMER DEFAULT (detik)">
              <input
                type="number"
                value={form.timer_default || 300}
                onChange={(e) =>
                  set('timer_default', parseInt(e.target.value) || 300)
                }
                min="60"
                max="1800"
                step="30"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
              <p className="text-xs text-benhur-700/60 mt-1">
                {Math.floor((form.timer_default || 300) / 60)} menit
              </p>
            </Field>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>

      {/* Modal Reset Event */}
      <Modal
        open={modalReset}
        onClose={() => setModalReset(false)}
        title="Reset Event"
        maxWidth="max-w-md"
      >
        <p className="text-benhur-700 text-sm">
          Yakin ingin reset event? Ini akan:
        </p>
        <ul className="text-sm text-benhur-700 mt-2 space-y-1 list-disc pl-5">
          <li>Kosongkan <strong>Nama Event</strong></li>
          <li>Reset nomor urut kembali ke <strong>1</strong></li>
          <li>Sesi berikutnya jadi <code>potoboks001</code></li>
        </ul>
        <p className="text-red-600 text-sm mt-3 font-medium">
          ⚠️ Sesi lama tidak terpengaruh, hanya slug baru yang berubah.
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
            onClick={onResetEvent}
            disabled={working}
            className="!bg-red-500 !text-white"
          >
            {working ? 'Memproses...' : 'Reset Event'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border-4 border-benhur-900 rounded-3xl p-5 shadow-[6px_6px_0_0_#0A1F44] space-y-4">
      <h2 className="font-extrabold text-benhur-900 text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}