import { supabase, BUCKET } from '../supabase';

// Generate slug acak 6 karakter
function generateSlug() {
  return Math.random().toString(36).slice(2, 8);
}

// Convert dataURL → Blob
async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return await res.blob();
}

// Upload 1 file ke Storage, return public URL
async function uploadFile(path, blob) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Simpan sesi lengkap ke Supabase
 * @param {Object} params
 * @param {Object} params.paket
 * @param {Object} params.frame
 * @param {string[]} params.photos - array dataURL foto mentah
 * @param {string} params.finalDataUrl - dataURL hasil composite
 * @param {number} params.retakeLeft
 * @returns {Promise<{sessionId: string, slug: string, shareUrl: string}>}
 */
export async function simpanSesi({
  paket,
  frame,
  photos,
  finalDataUrl,
  retakeLeft = 3,
}) {
  const sessionId = crypto.randomUUID();
  const slug = generateSlug();
  const expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Upload foto mentah
  const photoUrls = [];
  for (let i = 0; i < photos.length; i++) {
    const blob = await dataUrlToBlob(photos[i]);
    const path = `${sessionId}/photo-${i + 1}.jpg`;
    const url = await uploadFile(path, blob);
    photoUrls.push(url);
  }

  // 2. Upload final
  let finalUrl = null;
  if (finalDataUrl) {
    const finalBlob = await dataUrlToBlob(finalDataUrl);
    finalUrl = await uploadFile(`${sessionId}/final.jpg`, finalBlob);
  }

  // 3. Insert row session
  const { error: errSession } = await supabase.from('sessions').insert({
    id: sessionId,
    slug,
    paket_id: paket.id,
    paket_nama: paket.nama,
    harga: paket.harga,
    frame_id: frame.id,
    slot_count: photos.length,
    retake_left: retakeLeft,
    final_image_url: finalUrl,
    expired_at: expiredAt,
  });

  if (errSession) throw errSession;

  // 4. Insert foto mentah
  if (photoUrls.length) {
    const rows = photoUrls.map((url, i) => ({
      session_id: sessionId,
      slot_index: i,
      photo_url: url,
    }));
    const { error: errPhotos } = await supabase.from('session_photos').insert(rows);
    if (errPhotos) throw errPhotos;
  }

  const shareUrl = `${window.location.origin}/r/${slug}`;
  return { sessionId, slug, shareUrl };
}