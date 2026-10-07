import { supabase } from '../supabase';

/**
 * Ambil semua sesi dalam rentang hari tertentu
 * @param {number} hari - 7, 30, 90, atau null (semua)
 */
export async function ambilDataStatistik(hari = 30) {
  let q = supabase
    .from('sessions')
    .select('id, created_at, harga, paket_id, paket_nama, slot_count')
    .order('created_at', { ascending: false });

  if (hari) {
    const start = new Date();
    start.setDate(start.getDate() - hari);
    q = q.gte('created_at', start.toISOString());
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

/**
 * Hitung ringkasan (total sesi, omzet, rata-rata)
 */
export function hitungRingkasan(sessions) {
  const totalSesi = sessions.length;
  const omzetTotal = sessions.reduce((s, r) => s + (r.harga || 0), 0);
  const rataRata = totalSesi > 0 ? Math.round(omzetTotal / totalSesi) : 0;

  // Hari ini
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const sesiHariIni = sessions.filter(
    (s) => new Date(s.created_at) >= hariIni
  ).length;

  return { totalSesi, omzetTotal, rataRata, sesiHariIni };
}

/**
 * Data per hari untuk bar chart
 * @returns [{ label, value, date }]
 */
export function dataPerHari(sessions, jumlahHari = 30) {
  const map = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Inisialisasi semua hari dengan 0
  for (let i = jumlahHari - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = {
      date: key,
      label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      sesi: 0,
      omzet: 0,
    };
  }

  // Isi dari sessions
  sessions.forEach((s) => {
    const key = new Date(s.created_at).toISOString().slice(0, 10);
    if (map[key]) {
      map[key].sesi += 1;
      map[key].omzet += s.harga || 0;
    }
  });

  return Object.values(map);
}

/**
 * Data per bulan untuk bar chart (6 bulan terakhir)
 */
export function dataPerBulan(sessions, jumlahBulan = 6) {
  const map = {};
  const today = new Date();

  for (let i = jumlahBulan - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    map[key] = {
      date: key,
      label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      sesi: 0,
      omzet: 0,
    };
  }

  sessions.forEach((s) => {
    const d = new Date(s.created_at);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    if (map[key]) {
      map[key].sesi += 1;
      map[key].omzet += s.harga || 0;
    }
  });

  return Object.values(map);
}

/**
 * Top paket terlaris
 */
export function topPaket(sessions, limit = 5) {
  const map = {};
  sessions.forEach((s) => {
    if (!map[s.paket_id]) {
      map[s.paket_id] = {
        paket_id: s.paket_id,
        nama: s.paket_nama,
        jumlah: 0,
        omzet: 0,
      };
    }
    map[s.paket_id].jumlah += 1;
    map[s.paket_id].omzet += s.harga || 0;
  });

  return Object.values(map)
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, limit);
}

/**
 * Distribusi sesi per jam (0–23)
 */
export function dataPerJam(sessions) {
  const jam = Array.from({ length: 24 }, (_, i) => ({
    jam: i,
    label: String(i).padStart(2, '0') + ':00',
    jumlah: 0,
  }));

  sessions.forEach((s) => {
    const h = new Date(s.created_at).getHours();
    jam[h].jumlah += 1;
  });

  return jam;
}

/**
 * Format rupiah singkat (1.2jt, 250rb)
 */
export function formatRpShort(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'jt';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'rb';
  return String(n);
}