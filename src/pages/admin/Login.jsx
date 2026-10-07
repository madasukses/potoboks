import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import Button from '../../components/Button';

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/sesi';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (err) {
      setError(err.message || 'Login gagal');
      return;
    }

    nav(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-kuning-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-benhur-900 drop-shadow-[3px_3px_0_#FFC93C]">
            potoboks
          </h1>
          <div className="mt-2 inline-block bg-benhur-900 text-kuning-300 text-[10px] font-bold tracking-[0.4em] px-3 py-1 rounded-full">
            ADMIN
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="bg-white border-4 border-benhur-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0_0_#0A1F44]"
        >
          <h2 className="font-display text-2xl text-benhur-900 mb-6">Masuk</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@potoboks.id"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-3 font-medium text-benhur-900 focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-4 border-benhur-900 rounded-2xl px-4 py-3 font-medium text-benhur-900 focus:outline-none focus:ring-4 focus:ring-kuning-300"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6 text-lg"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <p className="text-center text-xs text-benhur-700/60 mt-6">
          Halaman ini hanya untuk admin potoboks
        </p>
      </div>
    </div>
  );
}