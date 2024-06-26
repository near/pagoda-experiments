import { WalletSelectorParams } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupNightly } from '@near-wallet-selector/nightly';
import { setupSender } from '@near-wallet-selector/sender';

import { NETWORK_ID } from './config';

const modules = [setupMyNearWallet(), setupSender(), setupHereWallet(), setupMeteorWallet(), setupNightly()];

const TESTNET_WALLET_SELECTOR_PARAMS: WalletSelectorParams = {
  network: 'testnet',
  modules,
};

const MAINNET_WALLET_SELECTOR_PARAMS: WalletSelectorParams = {
  network: 'mainnet',
  modules,
};

export const WALLET_SELECTOR_PARAMS =
  NETWORK_ID === 'mainnet' ? MAINNET_WALLET_SELECTOR_PARAMS : TESTNET_WALLET_SELECTOR_PARAMS;
