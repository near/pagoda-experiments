import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import { WalletModuleFactory, WalletSelectorParams } from '@near-wallet-selector/core';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupNightly } from '@near-wallet-selector/nightly';
import { setupFastAuthWallet } from 'near-fastauth-wallet';

import { usePurchasedTickets } from '@/hooks/usePurchasedTickets';

import { NETWORK_ID } from './config';
import type { FunderEventMetadata, TicketMetadataExtra } from './helpers';
const modules = [
  setupMyNearWallet(),
  setupBitteWallet(),
  setupMeteorWallet(),
  setupNightly(),
  setupFastAuthWallet({
    walletUrl:
      NETWORK_ID === 'testnet' ? 'https://wallet.testnet.near.org/fastauth' : 'https://wallet.near.org/fastauth',
    relayerUrl:
      NETWORK_ID === 'testnet' ? 'http://34.70.226.83:3030/relay' : 'https://near-relayer-mainnet.api.pagoda.co/relay',
  }),
];

export const WALLET_SELECTOR_PARAMS: WalletSelectorParams = {
  network: NETWORK_ID,
  modules: modules as WalletModuleFactory[],
};

export type EventDataForWallet = {
  event: FunderEventMetadata;
  tickets: {
    artwork?: string;
    description?: string;
    extra: TicketMetadataExtra;
    secretKey: string;
    title: string;
  }[];
};

export function stringifyEventDataForWallet(data: ReturnType<typeof usePurchasedTickets>['data']) {
  if (!data) return '';

  const result: EventDataForWallet = {
    event: data.event,
    tickets: data.tickets.map((ticket) => ({
      artwork: ticket.artwork,
      description: ticket.description,
      extra: ticket.extra,
      secretKey: ticket.secretKey,
      title: ticket.title,
    })),
  };

  return encodeURIComponent(btoa(JSON.stringify(result)));
}

export function decodeEventDataForWallet(data: string) {
  return JSON.parse(atob(decodeURIComponent(data))) as EventDataForWallet;
}
