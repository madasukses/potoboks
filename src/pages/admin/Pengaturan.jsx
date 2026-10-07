import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import {
  getSettings,
  updateSettings,
  uploadLogo,
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

  if (loading) {
    return (
      <div className="text-center py-12 text-benhur-700 font-bold">
        Memuat...
      </div>
    );
  }

  if (!form) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-benhur-900 mb-1">
          ⚙️ Pengaturan
        </h1>
        <p className="text-benhur-700/70 text-sm">
          Identitas bisnis, branding, dan preferensi default.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-3 text-sm text-green-700 font-medium mb-4">
          ✓ Pengaturan tersimpan
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
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

        <Section title="👀 Preview Halaman Publik">
          <div
            className="border-4 border-benhur-900 rounded-2xl p-6 text-center"
            style={{ background: '#FFF6D6' }}
          >
            {form.logo_url && (
              <img
                src={form.logo_url}
                alt="Logo"
                className="max-h-16 mx-auto mb-3"
              />
            )}
            <div
              className="font-display text-2xl mb-1"
              style={{ color: '#0A1F44' }}
            >
              {form.nama_bisnis || 'potoboks'}
            </div>
            <div className="text-sm text-benhur-700/70">
              {form.tagline || 'capture moments, create memories'}
            </div>

            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {form.whatsapp && (
                <span className="text-xs bg-white border-2 border-benhur-900 rounded-full px-3 py-1 font-bold">
                  💬 WhatsApp
                </span>
              )}
              {form.instagram && (
                <span className="text-xs bg-white border-2 border-benhur-900 rounded-full px-3 py-1 font-bold">
                  📷 Instagram
                </span>
              )}
              {form.tiktok && (
                <span className="text-xs bg-white border-2 border-benhur-900 rounded-full px-3 py-1 font-bold">
                  🎵 TikTok
                </span>
              )}
            </div>

            {form.alamat_publik && (
              <div
                className="mt-4 inline-block text-xs font-mono px-3 py-1 rounded-full border-2 border-benhur-900"
                style={{ background: form.warna_aksen || '#FFC93C' }}
              >
                potoboks.id/p/{form.alamat_publik}
              </div>
            )}
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
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