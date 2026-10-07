import { supabase, BUCKET } from '../supabase';

export async function listFrame() {
  const { data, error } = await supabase
    .from('frame')
    .select('*')
    .order('urutan', { ascending: true })
    .order('nama', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function tambahFrame(frame) {
  const { data, error } = await supabase
    .from('frame')
    .insert(frame)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFrame(id, updates) {
  const { data, error } = await supabase
    .from('frame')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleFrameAktif(id, aktif) {
  return updateFrame(id, { aktif });
}

export async function hapusFrame(id) {
  // Hapus juga file PNG overlay di Storage (kalau ada)
  try {
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list('frames', { search: id });
    if (files && files.length > 0) {
      const paths = files.map((f) => 'frames/' + f.name);
      await supabase.storage.from(BUCKET).remove(paths);
    }
  } catch (e) {
    console.warn('Gagal hapus file frame:', e);
  }

  const { error } = await supabase.from('frame').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Upload PNG overlay ke Storage
 * @returns public URL
 */
export async function uploadOverlay(file, frameId) {
  const ext = file.name.split('.').pop() || 'png';
  const path = 'frames/' + frameId + '.' + ext;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function generateFrameId(nama) {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}