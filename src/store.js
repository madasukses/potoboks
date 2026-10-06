import { create } from 'zustand';

const KEY = 'potoboks-state';

export const useStore = create((set) => ({
  paket: null,
  frame: null,
  slotCount: 6,
  photos: [],
  retakeLeft: 3,
  sessionId: null,

  setPaket: (p) => set({ paket: p }),
  setFrame: (f) => set({ frame: f }),
  setSlotCount: (n) => set({ slotCount: n, photos: [], retakeLeft: 3 }),
  setSessionId: (id) => set({ sessionId: id }),

  addPhoto: (dataUrl) =>
    set((s) => {
      const photos = [...s.photos, dataUrl];
      persist({ ...s, photos });
      return { photos };
    }),

  replacePhoto: (idx, dataUrl) =>
    set((s) => {
      const photos = s.photos.map((p, i) => (i === idx ? dataUrl : p));
      persist({ ...s, photos });
      return { photos, retakeLeft: Math.max(0, s.retakeLeft - 1) };
    }),

  reset: () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem('potoboks-final');
    set({ paket: null, frame: null, slotCount: 6, photos: [], retakeLeft: 3, sessionId: null });
  },
}));

function persist(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      paket: state.paket, frame: state.frame, slotCount: state.slotCount,
      photos: state.photos, retakeLeft: state.retakeLeft, sessionId: state.sessionId,
    }));
  } catch (e) {}
}

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved) useStore.setState(saved);
} catch (e) {}