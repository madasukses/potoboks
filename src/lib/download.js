import JSZip from 'jszip';
import { supabase, BUCKET } from '../supabase';

/**
 * Download 1 sesi sebagai ZIP
 */
export async function downloadSesi(session) {
  const zip = new JSZip();
  const folder = zip.folder('potoboks-' + session.slug);

  const { data: photos } = await supabase
    .from('session_photos')
    .select('*')
    .eq('session_id', session.id)
    .order('slot_index');

  const tasks = [];

  if (session.final_image_url) {
    tasks.push(
      fetch(session.final_image_url)
        .then((r) => r.blob())
        .then((b) => folder.file('final.jpg', b))
        .catch((e) => console.warn('Gagal ambil final:', e))
    );
  }

  (photos || []).forEach((p) => {
    tasks.push(
      fetch(p.photo_url)
        .then((r) => r.blob())
        .then((b) => folder.file('photo-' + (p.slot_index + 1) + '.jpg', b))
        .catch((e) => console.warn('Gagal ambil foto ' + p.slot_index, e))
    );
  });

  await Promise.all(tasks);

  const info = [
    'potoboks - Sesi ' + session.slug,
    '====================================',
    'Paket    : ' + session.paket_nama,
    'Harga    : Rp ' + (session.harga || 0).toLocaleString('id-ID'),
    'Frame    : ' + session.frame_id,
    'Slot     : ' + session.slot_count,
    'Waktu    : ' + new Date(session.created_at).toLocaleString('id-ID'),
    '',
    'Link publik: ' + window.location.origin + '/r/' + session.slug,
  ].join('\n');
  folder.file('info.txt', info);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'potoboks-' + session.slug + '.zip';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * HAPUS PERMANEN: hapus file Storage + hapus row session_photos + row sessions
 */
export async function hapusSesiPermanen(session) {
  const errors = [];

  // 1. Hapus semua file di Storage folder {session.id}/
  const { data: files, error: errList } = await supabase.storage
    .from(BUCKET)
    .list(session.id, { limit: 100 });

  if (errList) {
    errors.push('List storage: ' + errList.message);
  } else if (files && files.length > 0) {
    const paths = files.map((f) => session.id + '/' + f.name);
    const { error: errDel } = await supabase.storage
      .from(BUCKET)
      .remove(paths);
    if (errDel) errors.push('Delete storage: ' + errDel.message);
  }

  // 2. Hapus row session_photos
  const { error: errPhotos } = await supabase
    .from('session_photos')
    .delete()
    .eq('session_id', session.id);
  if (errPhotos) errors.push('Delete photos: ' + errPhotos.message);

  // 3. Hapus row sessions
  const { error: errSess } = await supabase
    .from('sessions')
    .delete()
    .eq('id', session.id);
  if (errSess) errors.push('Delete session: ' + errSess.message);

  if (errors.length) {
    throw new Error(errors.join(' | '));
  }
}

/**
 * Statistik dashboard
 */
export async function getStatistik() {
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  const { count: totalSesi } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true });

  const { count: sesiHariIni } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfToday);

  const { data: omzetData } = await supabase
    .from('sessions')
    .select('harga')
    .gte('created_at', startOfMonth);

  const omzetBulanIni = (omzetData || []).reduce(
    (s, r) => s + (r.harga || 0),
    0
  );

  const { count: totalFoto } = await supabase
    .from('session_photos')
    .select('*', { count: 'exact', head: true });

  const storagePerkiraan = ((totalFoto || 0) * 300) / 1024;

  return {
    totalSesi: totalSesi || 0,
    sesiHariIni: sesiHariIni || 0,
    omzetBulanIni,
    totalFoto: totalFoto || 0,
    storagePerkiraan,
  };
}