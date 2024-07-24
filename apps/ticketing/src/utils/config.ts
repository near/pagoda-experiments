import { NetworkId } from '@near-wallet-selector/core';

export const APPLE_WALLET_CERTIFICATE_PASSWORD = process.env.APPLE_WALLET_CERTIFICATE_PASSWORD || '';
export const APPLE_WALLET_CERTIFICATE_PEM = process.env.PASS_COM_PAGODA_TICKETING_PEM;
export const HOSTNAME = process.env.NEXT_PUBLIC_HOSTNAME || 'http://localhost:3000';
export const NETWORK_ID: NetworkId = (process.env.NEXT_PUBLIC_NETWORK_ID as NetworkId) || 'testnet';
export const NETWORK_NODE_URL = process.env.NEXT_PUBLIC_NETWORK_NODE_URL || 'https://rpc.testnet.near.org';
export const EVENTS_WORKER_BASE =
  process.env.NEXT_PUBLIC_EVENTS_WORKER_BASE || 'https://stripe-worker-template.keypom.workers.dev';
export const KEYPOM_CONTRACT_ID = process.env.NEXT_PUBLIC_KEYPOM_CONTRACT_ID || 'v2.keypom.testnet';
export const KEYPOM_EVENTS_CONTRACT_ID =
  process.env.NEXT_PUBLIC_KEYPOM_EVENTS_CONTRACT_ID || '1717013187496-kp-ticketing.testnet';
export const KEYPOM_MARKETPLACE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_KEYPOM_MARKETPLACE_CONTRACT_ID || '1717013187496-marketplace.testnet';
export const CLOUDFLARE_IPFS = process.env.NEXT_PUBLIC_CLOUDFLARE_IPFS || 'https://cloudflare-ipfs.com/ipfs';
