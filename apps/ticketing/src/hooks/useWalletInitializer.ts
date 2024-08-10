import { setupWalletSelector, type WalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { useRef } from 'react';
import { useEffect } from 'react';

import { useWalletStore } from '@/stores/wallet';
import { KEYPOM_CONTRACT_ID } from '@/utils/config';
import { WALLET_SELECTOR_PARAMS } from '@/utils/wallet';

export function useWalletInitializer() {
  const setupPromise = useRef<Promise<WalletSelector> | null>(null);
  const setState = useWalletStore((store) => store.setState);
  const setAccount = useWalletStore((store) => store.setAccount);
  const setWallet = useWalletStore((store) => store.setWallet);
  const setSelector = useWalletStore((store) => store.setSelector);
  const selector = useWalletStore((store) => store.selector);

  useEffect(() => {
    const initialize = async () => {
      if (!setupPromise.current) {
        setupPromise.current = setupWalletSelector(WALLET_SELECTOR_PARAMS);
      }

      const selector = await setupPromise.current;
      const modal = setupModal(selector as any, {
        contractId: KEYPOM_CONTRACT_ID,
        description: 'Sign in to start creating and managing your own events.',
        theme: 'auto',
      });

      setSelector(selector, modal);
    };

    initialize();
  }, [setSelector]);

  useEffect(() => {
    if (!selector) return;

    setState(selector.store.getState());

    const subscription = selector.store.observable.subscribe(async (value) => {
      setState(value);
      setAccount(value?.accounts[0] ?? null);

      if (value.accounts.length > 0 && value.selectedWalletId && selector) {
        const wallet = await selector.wallet();
        setWallet(wallet);
      } else {
        setWallet(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selector, setAccount, setState, setWallet]);
}
