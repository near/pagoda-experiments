import { Account, Near } from 'near-api-js';
import { create } from 'zustand';

type NearStore = {
  near: Near | null;
  viewAccount: Account | null;

  setNear: (wallet: Near | null) => void;
  setViewAccount: (viewAccount: Account | null) => void;
};

export const useNearStore = create<NearStore>((set) => ({
  near: null,
  viewAccount: null,

  setNear: (near) => set({ near }),
  setViewAccount: (viewAccount) => set({ viewAccount }),
}));
