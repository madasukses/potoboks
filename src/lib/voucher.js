import { supabase } from '../supabase';

export async function listVoucher() {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function tambahVoucher(voucher) {
  const { data, error } = await supabase
    .from('vouchers')
    .insert(voucher)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function tambahVoucherBatch(vouchers) {
  const { data, error } = await supabase
    .from('vouchers')
    .insert(vouchers)
    .select();

  if (error) throw error;
  return data || [];
}

export async function updateVoucher(id, updates) {
  const { data, error } = await supabase
    .from('vouchers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleVoucherAktif(id, aktif) {
  return updateVoucher(id, { aktif });
}

export async function hapusVoucher(id) {
  const { error } = await supabase.from('vouchers').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Generate kode voucher acak
 */
export function generateKode(prefix = 'PROMO') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = (n) =>
    Array.from({ length: n }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');

  return prefix.toUpperCase() + '-' + rand(4) + '-' + rand(4);
}

/**
 * Cek validitas voucher (untuk booth)
 */
export async function cekVoucher(kode) {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('kode', kode.trim().toUpperCase())
    .eq('aktif', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { valid: false, alasan: 'Kode tidak ditemukan' };

  if (data.expired_at && new Date(data.expired_at) < new Date()) {
    return { valid: false, alasan: 'Voucher sudah kadaluarsa' };
  }

  if (data.used_count >= data.max_usage) {
    return { valid: false, alasan: 'Voucher sudah habis dipakai' };
  }

  return { valid: true, voucher: data };
}

/**
 * Hitung harga setelah voucher
 */
export function hitungHarga(hargaAsli, voucher) {
  if (!voucher) return hargaAsli;

  if (voucher.tipe === 'gratis') return 0;
  if (voucher.tipe === 'diskon_nominal') {
    return Math.max(0, hargaAsli - voucher.nilai);
  }
  if (voucher.tipe === 'diskon_persen') {
    return Math.max(0, Math.round(hargaAsli * (1 - voucher.nilai / 100)));
  }
  return hargaAsli;
}

/**
 * Increment used_count voucher
 */
export async function pakaiVoucher(voucherId) {
  const { data: v, error: errGet } = await supabase
    .from('vouchers')
    .select('used_count')
    .eq('id', voucherId)
    .single();

  if (errGet) throw errGet;

  const { error } = await supabase
    .from('vouchers')
    .update({ used_count: (v.used_count || 0) + 1 })
    .eq('id', voucherId);

  if (error) throw error;
}