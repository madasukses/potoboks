import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function Landing() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-10">
        <h1 className="font-display text-6xl md:text-8xl text-benhur-900 drop-shadow-[4px_4px_0_#FFC93C]">
          potoboks
        </h1>
        <div className="mt-3 inline-block bg-benhur-900 text-kuning-300 text-[10px] font-bold tracking-[0.4em] px-3 py-1 rounded-full">
          PHOTO BOOTH
        </div>
        <p className="mt-4 text-benhur-700 font-semibold tracking-wide">
          capture moments, create memories
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-xl">
        <div className="flex-1 bg-white border-4 border-benhur-900 rounded-2xl px-5 py-4 text-left text-benhur-900/70 font-medium shadow-[6px_6px_0_0_#0A1F44]">
          potoboks.local
        </div>
        <Button onClick={() => nav('/paket')} className="text-xl">Mulai</Button>
      </div>

      <p className="mt-8 text-sm text-benhur-700/70">
        Tap di mana saja untuk memulai sesi foto
      </p>
    </div>
  );
}