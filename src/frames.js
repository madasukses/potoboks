export function hitungLayout(slotCount) {
  const W = 600;
  const PAD = 40;
  const GAP = 20;
  const slotW = W - PAD * 2;
  const slotH = slotW * 0.75;
  const H = PAD * 2 + slotCount * slotH + (slotCount - 1) * GAP;

  const slots = Array.from({ length: slotCount }, (_, i) => ({
    x: PAD,
    y: PAD + i * (slotH + GAP),
    w: slotW,
    h: slotH,
  }));

  return { W, H, slots };
}

export const FRAMES_FALLBACK = [
  { id:'retro-blue',   nama:'Retro Blue',   warna_bg:'#D6E2F5', warna_aksen:'#1E4FA8', slot_count:6 },
  { id:'sunny-yellow', nama:'Sunny Yellow', warna_bg:'#FFF6D6', warna_aksen:'#FFC93C', slot_count:6 },
  { id:'benhur-grid',  nama:'Benhur Grid',  warna_bg:'#123A7A', warna_aksen:'#FFC93C', slot_count:4 },
  { id:'mini-duo',     nama:'Mini Duo',     warna_bg:'#FFF6D6', warna_aksen:'#0A1F44', slot_count:2 },
];