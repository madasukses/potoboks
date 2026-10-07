import { supabase, BUCKET } from '../supabase';

export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateSettings(updates) {
  const { data, error } = await supabase
    .from('settings')
    .update({ ...updates, update_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadLogo(file) {
  const ext = file.name.split('.').pop() || 'png';
  const path = 'branding/logo.' + ext;

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