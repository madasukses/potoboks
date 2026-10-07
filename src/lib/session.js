import { supabase, BUCKET } from '../supabase';

function generateSlug() {
  return Math.random().toString(36).slice(2, 8);
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return await res.blob();
}

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
 * Upload foto & final, update session yang sudah ada.
 * Session sudah dibuat di halaman /bayar (dengan slug sementara).
 */
export async function simpanSesi({
  paket,
  frame,
  photos,
  finalDataUrl,
  retakeLeft = 3,
  sessionId,
}) {
  if (!sessionId) throw new Error('sessionId tidak ditemukan');

  const slug = generateSlug();

  // 1. Upload foto mentah
  const photoUrls = [];
  for (let i = 0; i < photos.length; i++) {
    const blob = await dataUrlToBlob(photos[i]);
    const path = sessionId + '/photo-' + (i + 1) + '.jpg';
    const url = await uploadFile(path, blob);
    photoUrls.push(url);
  }

  // 2. Upload final
  let finalUrl = null;
  if (finalDataUrl) {
    const finalBlob = await dataUrlToBlob(finalDataUrl);
    finalUrl = await uploadFile(sessionId + '/final.jpg', finalBlob);
  }

  // 3. UPDATE session yang sudah ada
  const { error: errUpd } = await supabase
    .from('sessions')
    .update({
      slug,
      frame_id: frame.id,
      slot_count: photos.length,
      retake_left: retakeLeft,
      final_image_url: finalUrl,
    })
    .eq('id', sessionId);

  if (errUpd) throw errUpd;

  // 4. INSERT session_photos (kalau belum ada)
  //    Hapus dulu untuk jaga-jaga (kalau retake / upload ulang)
  await supabase.from('session_photos').delete().eq('session_id', sessionId);

  if (photoUrls.length) {
    const rows = photoUrls.map((url, i) => ({
      session_id: sessionId,
      slot_index: i,
      photo_url: url,
    }));
    const { error: errPhotos } = await supabase
      .from('session_photos')
      .insert(rows);
    if (errPhotos) throw errPhotos;
  }

  const shareUrl = window.location.origin + '/r/' + slug;
  return { sessionId, slug, shareUrl };
}