import { supabase } from '../supabase';

export async function buatPayment({
  sessionId,
  metode,
  jumlahAsli,
  jumlahBayar,
  voucherKode,
  qrisUrl,
  expiredAt,
  catatan,
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      session_id: sessionId,
      metode,
      jumlah_asli: jumlahAsli,
      jumlah_bayar: jumlahBayar,
      voucher_kode: voucherKode || null,
      status: 'pending',
      qris_url: qrisUrl || null,
      expired_at: expiredAt || null,
      catatan: catatan || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(id, status, extra = {}) {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status,
      ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}),
      ...extra,
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Payment tidak ditemukan atau tidak bisa diupdate');
  }
  return data[0];
}

export async function getPaymentBySession(sessionId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPaymentById(id) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Ambil daftar payment untuk admin/operator
 */
export async function listPayments({ status } = {}) {
  let q = supabase
    .from('payments')
    .select('*, sessions(slug, paket_nama, created_at)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}