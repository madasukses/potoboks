import { useEffect, useState } from 'react';
import BarChart from '../../components/admin/BarChart';
import {
  ambilDataStatistik,
  hitungRingkasan,
  dataPerHari,
  dataPerBulan,
  topPaket,
  dataPerJam,
  formatRpShort,
} from '../../lib/statistik';

const PERIODE = [
  { value: 7, label: '7 Hari' },
  { value: 30, label: '30 Hari' },
  { value: 90, label: '90 Hari' },
  { value: null, label: 'Semua' },
];

export default function Statistik() {
  const [hari, setHari] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const sessions = await ambilDataStatistik(hari);

      // Ambil semua sesi (tanpa filter) untuk data bulanan
      const allSessions = hari !== null ? await ambilDataStatistik(null) : sessions;

      setStats({
        ringkasan: hitungRingkasan(sessions),
        perHari: dataPerHari(sessions, hari && hari <= 90 ? hari : 30),
        perBulan: dataPerBulan(allSessions, 6),
        topPaket: topPaket(sessions, 5),
        perJam: dataPerJam(sessions),
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hari]);

  const fmtRp = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-benhur-900 mb-1">
            📊 Statistik
          </h1>
          <p className="text-benhur-700/70 text-sm">
            Pantau performa booth: sesi, omzet, paket terlaris.
          </p>
        </div>

        {/* Filter periode */}
        <div className="flex gap-1 bg-white border-4 border-benhur-900 rounded-full p-1 shadow-[4px_4px_0_0_#0A1F44]">
          {PERIODE.map((p) => (
            <button
              key={String(p.value)}
              onClick={() => setHari(p.value)}
              className={
                'px-4 py-1.5 rounded-full text-xs font-extrabold transition ' +
                (hari === p.value
                  ? 'bg-kuning-500 text-benhur-900'
                  : 'text-benhur-700 hover:bg-kuning-100')
              }
            >
              {p.label}
            </button>
          ))}
        </div>
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

      {!loading && stats && (
        <div className="space-y-5">
          {/* Ringkasan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="TOTAL SESI"
              value={stats.ringkasan.totalSesi}
              suffix="sesi"
            />
            <StatCard
              label="HARI INI"
              value={stats.ringkasan.sesiHariIni}
              suffix="sesi"
            />
            <StatCard
              label="OMZET TOTAL"
              value={fmtRp(stats.ringkasan.omzetTotal)}
            />
            <StatCard
              label="RATA-RATA / SESI"
              value={fmtRp(stats.ringkasan.rataRata)}
            />
          </div>

          {/* Sesi per hari */}
          <Card title="📅 Sesi per Hari" subtitle={'Rentang ' + (hari || 'semua') + ' hari'}>
            <BarChart
              data={stats.perHari.map((d) => ({
                label: d.label,
                value: d.sesi,
                omzet: d.omzet,
              }))}
              valueKey="value"
              labelKey="label"
              color="#123A7A"
              height={180}
              formatValue={(v) => v + ' sesi'}
            />
          </Card>

          {/* Omzet per bulan */}
          <Card title="💰 Omzet per Bulan" subtitle="6 bulan terakhir">
            <BarChart
              data={stats.perBulan.map((d) => ({
                label: d.label,
                value: d.omzet,
              }))}
              valueKey="value"
              labelKey="label"
              color="#FFC93C"
              height={180}
              formatValue={(v) => fmtRp(v)}
            />
          </Card>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Top paket */}
            <Card title="🏆 Paket Terlaris" subtitle="Top 5">
              {stats.topPaket.length === 0 ? (
                <div className="text-center text-xs text-benhur-700/60 py-6">
                  Belum ada data
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.topPaket.map((p, i) => (
                    <div
                      key={p.paket_id}
                      className="flex items-center gap-3 bg-kuning-100 border-2 border-benhur-900 rounded-xl px-3 py-2"
                    >
                      <div
                        className={
                          'w-8 h-8 rounded-full border-2 border-benhur-900 flex items-center justify-center font-extrabold text-sm ' +
                          (i === 0
                            ? 'bg-kuning-500'
                            : i === 1
                            ? 'bg-gray-300'
                            : i === 2
                            ? 'bg-orange-300'
                            : 'bg-white')
                        }
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-extrabold text-benhur-900 text-sm">
                          {p.nama}
                        </div>
                        <div className="text-xs text-benhur-700/70">
                          {p.jumlah} sesi · {fmtRp(p.omzet)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Jam tersibuk */}
            <Card title="⏰ Jam Tersibuk" subtitle="Distribusi per jam">
              <BarChart
                data={stats.perJam.map((d) => ({
                  label: d.label,
                  value: d.jumlah,
                }))}
                valueKey="value"
                labelKey="label"
                color="#7B2CBF"
                height={140}
                formatValue={(v) => v + ' sesi'}
              />
            </Card>
          </div>
        </div>
      )}
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

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white border-4 border-benhur-900 rounded-3xl p-5 shadow-[6px_6px_0_0_#0A1F44]">
      <div className="mb-4">
        <h2 className="font-extrabold text-benhur-900">{title}</h2>
        {subtitle && (
          <div className="text-xs text-benhur-700/60">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}