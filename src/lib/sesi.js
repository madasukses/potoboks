import { supabase } from '../supabase';

/**
 * Ambil daftar sesi dengan filter opsional
 */
export async function listSesi({ search, paketId, status } = {}) {
  let q = supabase
    .from('sessions')
    .select('*, session_photos(count)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (search) {
    q = q.or(`slug.ilike.%${search}%,paket_nama.ilike.%${search}%`);
  }
  if (paketId) {
    q = q.eq('paket_id', paketId);
  }
  if (status === 'live') {
    q = q.eq('photos_cleared', false);
  }
  if (status === 'archived') {
    q = q.eq('photos_cleared', true);
  }

  const { data, error } = await q;
  if (error) throw error;

  return (data || []).map((s) => ({
    ...s,
    photo_count: s.session_photos?.[0]?.count || 0,
  }));
}

/**
 * Ambil detail sesi + foto mentah
 */
export async function getSesiDetail(id) {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  const { data: photos } = await supabase
    .from('session_photos')
    .select('*')
    .eq('session_id', id)
    .order('slot_index');

  return { session, photos: photos || [] };
}