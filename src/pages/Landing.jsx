import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '../lib/settings';
import Button from '../components/Button';

export default function Landing() {
  const nav = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  const mulai = () => nav('/paket');

  return (
    <div
      onClick={mulai}
      onTouchStart={mulai}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center cursor-pointer select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') mulai();
      }}
    >
      <div className="mb-10">
        {/* Logo (kalau ada) */}
        {settings?.logo_url && (
          <img
            src={settings.logo_url}
            alt="Logo"
            className="max-h-24 mx-auto mb-4"
          />
        )}

        {/* Nama bisnis */}
        <h1 className="font-display text-6xl md:text-8xl text-benhur-900 drop-shadow-[4px_4px_0_#FFC93C]">
          {settings?.nama_bisnis || 'potoboks'}
        </h1>

        {/* Badge */}
        <div className="mt-3 inline-block bg-benhur-900 text-kuning-300 text-[10px] font-bold tracking-[0.4em] px-3 py-1 rounded-full">
          PHOTO BOOTH
        </div>

        {/* Tagline */}
        <p className="mt-4 text-benhur-700 font-semibold tracking-wide">
          {settings?.tagline || 'capture moments, create memories'}
        </p>
      </div>

      {/* Input display + Mulai */}
      <div
        className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex-1 bg-white border-4 border-benhur-900 rounded-2xl px-5 py-4 text-left text-benhur-900/70 font-medium shadow-[6px_6px_0_0_#0A1F44]">
          {settings?.alamat_publik
            ? 'potoboks.id/p/' + settings.alamat_publik
            : 'potoboks.local'}
        </div>
        <Button onClick={mulai} className="text-xl">
          Mulai
        </Button>
      </div>

      <p className="mt-8 text-sm text-benhur-700/70">
        Tap di mana saja untuk memulai sesi foto
      </p>
    </div>
  );
}