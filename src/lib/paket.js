import { supabase } from '../supabase';

// Ambil semua paket (termasuk yang nonaktif)
export async function listPaket() {
  const { data, error } = await supabase
    .from('paket')
    .select('*')
    .order('harga', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Tambah paket baru
export async function tambahPaket(paket) {
  const { data, error } = await supabase
    .from('paket')
    .insert(paket)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update paket
export async function updatePaket(id, updates) {
  const { data, error } = await supabase
    .from('paket')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Toggle aktif/nonaktif
export async function togglePaketAktif(id, aktif) {
  return updatePaket(id, { aktif });
}

// Hapus permanen
export async function hapusPaket(id) {
  const { error } = await supabase
    .from('paket')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Generate ID dari nama (slug)
export function generatePaketId(nama) {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}