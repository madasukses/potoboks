import { supabase, BUCKET } from '../supabase';

/**
 * Generate slug nomor urut: potoboks001, potoboks002, ...
 * Pakai RPC Supabase (next_session_number) supaya atomic.
 */
async function generateSlug() {
  const { data, error } = await supabase.rpc('next_session_number');
  if (error) throw error;

  const nomor = data || 1;
  return 'potoboks' + String(nomor).padStart(3, '0');
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
 * Session sudah dibuat di halaman /bayar (slug sementara).
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

  // 1. Generate slug nomor urut
  const slug = await generateSlug();

  // 2. Upload foto mentah
  const photoUrls = [];
  for (let i = 0; i < photos.length; i++) {
    const blob = await dataUrlToBlob(photos[i]);
    const path = sessionId + '/photo-' + (i + 1) + '.jpg';
    const url = await uploadFile(path, blob);
    photoUrls.push(url);
  }

  // 3. Upload final
  let finalUrl = null;
  if (finalDataUrl) {
    const finalBlob = await dataUrlToBlob(finalDataUrl);
    finalUrl = await uploadFile(sessionId + '/final.jpg', finalBlob);
  }

  // 4. UPDATE session yang sudah ada
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

  // 5. Hapus dulu session_photos (jaga-jaga kalau retake / upload ulang)
  await supabase.from('session_photos').delete().eq('session_id', sessionId);

  // 6. Insert ulang
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

/**
 * Rename slug manual (dari admin)
 */
export async function renameSlug(sessionId, slugBaru) {
  const slug = slugBaru
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 40);

  if (!slug) throw new Error('Slug tidak valid');

  const { data, error } = await supabase
    .from('sessions')
    .update({ slug })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
