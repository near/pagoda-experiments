import { WalletSelectorParams } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupNightly } from '@near-wallet-selector/nightly';
import { setupSender } from '@near-wallet-selector/sender';

const modules = [setupMyNearWallet(), setupSender(), setupHereWallet(), setupMeteorWallet(), setupNightly()];

export const TESTNET_WALLET_SELECTOR_PARAMS: WalletSelectorParams = {
  network: 'testnet',
  modules,
};

export const MAINNET_WALLET_SELECTOR_PARAMS: WalletSelectorParams = {
  network: 'mainnet',
  modules,
};
