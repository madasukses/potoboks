import { supabase, BUCKET } from '../supabase';

/**
 * Generate slug: [namaevent]-[nomor] atau potoboks[nomor]
 * Contoh: budi-wedding-001, potoboks002
 */
async function generateSlug() {
  // 1. Ambil nama event dari settings
  const { data: settings } = await supabase
    .from('settings')
    .select('nama_event')
    .eq('id', 1)
    .maybeSingle();

  const namaEvent = settings?.nama_event?.trim();

  // 2. Ambil nomor berikutnya
  const { data: nomor, error } = await supabase.rpc('next_session_number');
  if (error) throw error;

  const nomorStr = String(nomor || 1).padStart(3, '0');

  if (namaEvent) {
    // Sanitasi nama event: lowercase, ganti spasi jadi dash
    const prefix = namaEvent
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);

    return prefix + '-' + nomorStr;
  }

  return 'potoboks' + nomorStr;
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

export async function simpanSesi({
  paket,
  frame,
  photos,
  finalDataUrl,
  retakeLeft = 3,
  sessionId,
}) {
  if (!sessionId) throw new Error('sessionId tidak ditemukan');

  const slug = await generateSlug();

  // Upload foto mentah
  const photoUrls = [];
  for (let i = 0; i < photos.length; i++) {
    const blob = await dataUrlToBlob(photos[i]);
    const path = sessionId + '/photo-' + (i + 1) + '.jpg';
    const url = await uploadFile(path, blob);
    photoUrls.push(url);
  }

  // Upload final
  let finalUrl = null;
  if (finalDataUrl) {
    const finalBlob = await dataUrlToBlob(finalDataUrl);
    finalUrl = await uploadFile(sessionId + '/final.jpg', finalBlob);
  }

  // Update session
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

  // Insert foto
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