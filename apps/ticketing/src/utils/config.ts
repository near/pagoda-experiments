import { NetworkId } from '@near-wallet-selector/core';

export const APPLE_WALLET_CERTIFICATE_PASSWORD = process.env.APPLE_WALLET_CERTIFICATE_PASSWORD || '';
export const HOSTNAME = process.env.NEXT_PUBLIC_HOSTNAME || 'http://localhost:3000';
export const NETWORK_ID: NetworkId = (process.env.NEXT_PUBLIC_NETWORK_ID as NetworkId) || 'testnet';
