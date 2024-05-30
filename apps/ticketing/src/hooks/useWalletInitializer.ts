import { setupWalletSelector, type WalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { useRef } from 'react';
import { useEffect } from 'react';

import { useWalletStore } from '@/stores/wallet';
import { NETWORK_ID } from '@/utils/config';
import { MAINNET_KEYPOM_CONTRACT_ID, TESTNET_KEYPOM_CONTRACT_ID } from '@/utils/keypom';
import { MAINNET_WALLET_SELECTOR_PARAMS, TESTNET_WALLET_SELECTOR_PARAMS } from '@/utils/wallet';

export function useWalletInitializer() {
  const walletSelectorSetupPromise = useRef<Promise<WalletSelector> | null>(null);
  const setState = useWalletStore((store) => store.setState);
  const setAccount = useWalletStore((store) => store.setAccount);
  const setWallet = useWalletStore((store) => store.setWallet);
  const setSelector = useWalletStore((store) => store.setSelector);
  const selector = useWalletStore((store) => store.selector);

  const params = NETWORK_ID === 'mainnet' ? MAINNET_WALLET_SELECTOR_PARAMS : TESTNET_WALLET_SELECTOR_PARAMS;
  const contractId = NETWORK_ID === 'mainnet' ? MAINNET_KEYPOM_CONTRACT_ID : TESTNET_KEYPOM_CONTRACT_ID;

  useEffect(() => {
    const initialize = async () => {
      if (!walletSelectorSetupPromise.current) {
        walletSelectorSetupPromise.current = setupWalletSelector(params);
      }

      const selector = await walletSelectorSetupPromise.current;

      const modal = setupModal(selector, {
        contractId,
        description: 'Sign in to start creating and managing your own events.',
        theme: 'auto',
      });

      setSelector(selector, modal);
    };

    initialize();
  }, [contractId, params, setSelector]);

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
