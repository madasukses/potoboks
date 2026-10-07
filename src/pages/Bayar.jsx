import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useStore } from '../store';
import Button from '../components/Button';
import Timer from '../components/Timer';
import { cekVoucher, hitungHarga, pakaiVoucher } from '../lib/voucher';
import {
  buatPayment,
  updatePaymentStatus,
  getPaymentById,
} from '../lib/payment';
import { supabase } from '../supabase';

export default function Bayar() {
  const nav = useNavigate();
  const { paket, setVoucher, voucher } = useStore();

  const [kode, setKode] = useState(voucher?.kode || '');
  const [voucherAktif, setVoucherAktif] = useState(voucher || null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [metode, setMetode] = useState('qris');
  const [statusPoll, setStatusPoll] = useState(null); // status dari polling

  const pollRef = useRef(null);

  useEffect(() => {
    if (!paket) nav('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paket]);

  const hargaAsli = paket?.harga || 0;
  const hargaBayar = hitungHarga(hargaAsli, voucherAktif);
  const isGratis = hargaBayar === 0;

  // ============ Cek Voucher ============
  const onCekVoucher = async () => {
    if (!kode.trim()) return;
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await cekVoucher(kode);

      if (!res.valid) {
        setError(res.alasan);
        setVoucherAktif(null);
        setVoucher(null);
        return;
      }

      if (res.voucher.paket_id && res.voucher.paket_id !== paket.id) {
        setError('Voucher tidak berlaku untuk paket ini');
        setVoucherAktif(null);
        setVoucher(null);
        return;
      }

      setVoucherAktif(res.voucher);
      setVoucher(res.voucher);
      setInfo('✓ Voucher aktif!');
    } catch (e) {
      setError('Gagal cek voucher: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const onHapusVoucher = () => {
    setVoucherAktif(null);
    setVoucher(null);
    setKode('');
    setInfo(null);
    setError(null);
  };

  // ============ Bayar ============
  const onBayar = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Bikin SESSION dulu (FK)
      const sessionId = crypto.randomUUID();
      sessionStorage.setItem('potoboks-session-id', sessionId);

      const expiredAtSession = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const slugSementara = 'tmp-' + Math.random().toString(36).slice(2, 8);

      const { error: errSession } = await supabase.from('sessions').insert({
        id: sessionId,
        slug: slugSementara,
        paket_id: paket.id,
        paket_nama: paket.nama,
        harga: hargaBayar,
        frame_id: '',
        slot_count: paket.slot || 6,
        retake_left: 3,
        final_image_url: null,
        expired_at: expiredAtSession,
      });

      if (errSession) throw errSession;

      // 2. Metode final
      let metodeFinal = metode;
      if (isGratis) metodeFinal = 'voucher';

      // 3. QR payload (sementara)
      const qrisPayload =
        'POTOBOKS-' +
        sessionId.slice(0, 8).toUpperCase() +
        '-RP' +
        hargaBayar;

      // 4. Bikin payment record
      const expiredAtPayment = new Date(
        Date.now() + 15 * 60 * 1000
      ).toISOString();

      const pay = await buatPayment({
        sessionId,
        metode: metodeFinal,
        jumlahAsli: hargaAsli,
        jumlahBayar: hargaBayar,
        voucherKode: voucherAktif?.kode,
        qrisUrl: metodeFinal === 'qris' && !isGratis ? qrisPayload : null,
        expiredAt: expiredAtPayment,
        catatan: isGratis
          ? 'Voucher gratis'
          : metodeFinal === 'tunai'
          ? 'Bayar tunai ke operator'
          : null,
      });

      setPayment(pay);

      // 5. Kalau gratis → langsung lunas, tidak perlu approve
      if (isGratis) {
        await updatePaymentStatus(pay.id, 'paid');
        if (voucherAktif) await pakaiVoucher(voucherAktif.id);
        setTimeout(() => nav('/frame'), 1000);
      }
    } catch (e) {
      setError('Gagal membuat pembayaran: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ Auto-poll status payment ============
  useEffect(() => {
    if (!payment || payment.status === 'paid' || isGratis) return;

    const tick = async () => {
      try {
        const fresh = await getPaymentById(payment.id);
        if (!fresh) return;
        setStatusPoll(fresh.status);

        if (fresh.status === 'paid') {
          // Lunas → lanjut
          if (voucherAktif) await pakaiVoucher(voucherAktif.id);
          clearInterval(pollRef.current);
          nav('/frame');
        }
      } catch (e) {
        // diamkan error polling
      }
    };

    tick(); // langsung cek pertama
    pollRef.current = setInterval(tick, 3000); // tiap 3 detik

    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment, isGratis]);

  if (!paket) return null;

  return (
    <div className="min-h-screen px-4 py-8">
      <Timer detik={300} onHabis={() => nav('/')} />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => nav('/paket')}
            className="bg-white border-4 border-benhur-900 rounded-xl px-5 py-2 font-bold shadow-[4px_4px_0_0_#0A1F44] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0A1F44] transition"
          >
            ← Kembali
          </button>
          <div className="text-right">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70">
              LANGKAH 2 DARI 4
            </div>
            <div className="font-display text-lg text-benhur-900">
              Pembayaran
            </div>
          </div>
        </div>

        {/* Ringkasan Paket */}
        <div className="bg-kuning-100 border-4 border-benhur-900 rounded-3xl p-6 mb-5 shadow-[6px_6px_0_0_#0A1F44]">
          <div className="text-xs font-bold tracking-widest text-benhur-700/70">
            PAKET DIPILIH
          </div>
          <div className="font-display text-3xl text-benhur-900 mt-1">
            {paket.nama}
          </div>
          <div className="text-benhur-700 mt-1">{paket.deskripsi}</div>

          <div className="mt-4 border-t-2 border-benhur-900/20 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-benhur-700">Harga paket</span>
              <span className="font-bold">
                Rp {hargaAsli.toLocaleString('id-ID')}
              </span>
            </div>

            {voucherAktif && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Voucher {voucherAktif.kode}</span>
                <span className="font-bold">
                  − Rp {(hargaAsli - hargaBayar).toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <div className="flex justify-between text-lg pt-2 border-t-2 border-benhur-900/20">
              <span className="font-extrabold">Total Bayar</span>
              <span className="font-extrabold text-benhur-900">
                {isGratis
                  ? 'GRATIS'
                  : 'Rp ' + hargaBayar.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Voucher (belum bayar) */}
        {!payment && (
          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-5 mb-5 shadow-[6px_6px_0_0_#0A1F44]">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70 mb-2">
              PUNYA KODE VOUCHER?
            </div>

            {voucherAktif ? (
              <div className="flex items-center justify-between bg-green-50 border-2 border-green-400 rounded-2xl px-4 py-3">
                <div>
                  <div className="font-mono font-extrabold text-green-700">
                    {voucherAktif.kode}
                  </div>
                  <div className="text-xs text-green-600">
                    {voucherAktif.tipe === 'gratis'
                      ? 'Gratis'
                      : voucherAktif.tipe === 'diskon_nominal'
                      ? 'Diskon Rp ' +
                        voucherAktif.nilai.toLocaleString('id-ID')
                      : 'Diskon ' + voucherAktif.nilai + '%'}
                  </div>
                </div>
                <button
                  onClick={onHapusVoucher}
                  className="text-xs font-bold text-red-600 underline"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  placeholder="PROMO-XXXX-XXXX"
                  className="flex-1 border-4 border-benhur-900 rounded-2xl px-4 py-2.5 font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-4 focus:ring-kuning-300"
                />
                <Button
                  onClick={onCekVoucher}
                  disabled={loading || !kode.trim()}
                  className="!px-5 !py-2.5 text-sm"
                >
                  Pakai
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pilih Metode (kalau belum bayar & tidak gratis) */}
        {!payment && !isGratis && (
          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-5 mb-5 shadow-[6px_6px_0_0_#0A1F44]">
            <div className="text-xs font-bold tracking-widest text-benhur-700/70 mb-3">
              PILIH METODE BAYAR
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetode('qris')}
                className={
                  'border-4 border-benhur-900 rounded-2xl p-4 text-center transition ' +
                  (metode === 'qris'
                    ? 'bg-kuning-500 shadow-[4px_4px_0_0_#0A1F44]'
                    : 'bg-white hover:bg-kuning-100')
                }
              >
                <div className="text-3xl mb-1">💳</div>
                <div className="font-extrabold text-benhur-900 text-sm">
                  QRIS
                </div>
                <div className="text-[10px] text-benhur-700/70 mt-0.5">
                  GoPay, OVO, DANA, dll
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMetode('tunai')}
                className={
                  'border-4 border-benhur-900 rounded-2xl p-4 text-center transition ' +
                  (metode === 'tunai'
                    ? 'bg-kuning-500 shadow-[4px_4px_0_0_#0A1F44]'
                    : 'bg-white hover:bg-kuning-100')
                }
              >
                <div className="text-3xl mb-1">💵</div>
                <div className="font-extrabold text-benhur-900 text-sm">
                  Tunai
                </div>
                <div className="text-[10px] text-benhur-700/70 mt-0.5">
                  Bayar ke operator
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Error / Info */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-sm text-red-600 font-medium mb-4">
            {error}
          </div>
        )}
        {info && !error && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-3 text-sm text-green-700 font-medium mb-4">
            {info}
          </div>
        )}

        {/* Tombol Bayar atau Halaman Tunggu */}
        {!payment ? (
          <Button
            onClick={onBayar}
            disabled={loading}
            className="w-full text-xl !py-4"
          >
            {loading
              ? 'Memproses...'
              : isGratis
              ? 'Lanjut (Gratis)'
              : metode === 'tunai'
              ? 'Tampilkan Instruksi Tunai'
              : 'Tampilkan QRIS'}
          </Button>
        ) : (
          <div className="bg-white border-4 border-benhur-900 rounded-3xl p-6 shadow-[6px_6px_0_0_#0A1F44] text-center">
            {isGratis ? (
              <>
                <div className="text-5xl mb-3">✓</div>
                <h2 className="font-display text-2xl text-benhur-900 mb-2">
                  Berhasil!
                </h2>
                <p className="text-benhur-700 text-sm">
                  Voucher gratis aktif. Mengalihkan...
                </p>
              </>
            ) : metode === 'tunai' ? (
              <>
                <div className="text-5xl mb-3">💵</div>
                <h2 className="font-display text-2xl text-benhur-900 mb-2">
                  Bayar Tunai ke Operator
                </h2>
                <p className="text-benhur-700 text-sm mb-4">
                  Silakan bayar{' '}
                  <strong className="text-benhur-900">
                    Rp {hargaBayar.toLocaleString('id-ID')}
                  </strong>{' '}
                  ke operator.
                </p>

                <div className="bg-kuning-100 border-2 border-benhur-900 rounded-2xl p-4 mb-4">
                  <div className="text-xs font-bold text-benhur-700/70 mb-1">
                    KODE SESI
                  </div>
                  <div className="font-mono font-extrabold text-benhur-900 text-2xl tracking-widest">
                    {payment.session_id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="text-[10px] text-benhur-700/60 mt-1">
                    Sebutkan kode ini ke operator
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl text-benhur-900 mb-2">
                  Scan QRIS
                </h2>
                <p className="text-benhur-700 text-sm mb-4">
                  GoPay, OVO, DANA, ShopeePay, m-banking
                </p>

                <div className="bg-kuning-100 border-4 border-benhur-900 rounded-2xl p-4 inline-block mb-4">
                  <QRCodeCanvas value={payment.qris_url} size={200} />
                </div>

                <div className="text-3xl font-extrabold text-benhur-900 mb-2">
                  Rp {hargaBayar.toLocaleString('id-ID')}
                </div>
              </>
            )}

            {/* Polling indicator */}
            {!isGratis && (
              <div className="mt-4 pt-4 border-t-2 border-benhur-900/10">
                <div className="flex items-center justify-center gap-2 text-sm text-benhur-700">
                  <div className="w-3 h-3 rounded-full bg-kuning-500 animate-pulse" />
                  <span className="font-bold">
                    Menunggu konfirmasi operator...
                  </span>
                </div>
                <p className="text-xs text-benhur-700/60 mt-1">
                  Halaman ini otomatis lanjut setelah operator konfirmasi
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}