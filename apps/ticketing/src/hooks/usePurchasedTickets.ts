import { getPubFromSecret } from '@keypom/core';
import { handleClientError } from '@near-pagoda/ui';
import { useQuery } from '@tanstack/react-query';
import { Account } from 'near-api-js';

import { useNearStore } from '@/stores/near';
import { KEYPOM_EVENTS_CONTRACT_ID } from '@/utils/config';
import { EventDrop, FunderEventMetadata, TicketMetadataExtra } from '@/utils/helpers';

export function usePurchasedTickets(secretKeys: string[]) {
  const viewAccount = useNearStore((store) => store.viewAccount);

  const query = useQuery({
    enabled: !!viewAccount && secretKeys.length > 0,
    queryKey: ['purchased-tickets', secretKeys.join(',')],
    queryFn: async () => {
      try {
        if (!viewAccount) throw new Error('View account has not initialized yet');

        const tickets: Awaited<ReturnType<typeof fetchDetailsForPurchasedTicket>>[] = [];

        for (const secretKey of secretKeys) {
          const ticket = await fetchDetailsForPurchasedTicket(secretKey, viewAccount);
          tickets.push(ticket);
        }

        const firstTicket = tickets[0];

        if (!firstTicket) {
          throw new Error('No matching tickets found for secret keys');
        }

        const funderInfo = await viewAccount.viewFunction({
          contractId: KEYPOM_EVENTS_CONTRACT_ID,
          methodName: 'get_funder_info',
          args: { account_id: firstTicket.drop.funder_id },
        });

        const events = Object.values(JSON.parse(funderInfo.metadata)) as FunderEventMetadata[];
        const event = events.find((ev) => ev.id === firstTicket.extra.eventId);
        if (!event) throw new Error('Event not found for purchased tickets');

        return {
          event,
          publisherAccountId: firstTicket.drop.funder_id,
          tickets,
        };
      } catch (error) {
        handleClientError({
          title: 'Failed to load purchased tickets',
          error,
        });
      }

      return null;
    },
  });

  return query;
}

export async function fetchDetailsForPurchasedTicket(secretKey: string, viewAccount: Account | null | undefined) {
  if (!viewAccount) throw new Error('View account has not initialized yet');

  const publicKey = getPubFromSecret(secretKey);

  const keyInfo: { drop_id: string; uses_remaining: number } = await viewAccount.viewFunction({
    contractId: KEYPOM_EVENTS_CONTRACT_ID,
    methodName: 'get_key_information',
    args: { key: publicKey },
  });

  const drop: EventDrop = await viewAccount.viewFunction({
    contractId: KEYPOM_EVENTS_CONTRACT_ID,
    methodName: 'get_drop_information',
    args: { drop_id: keyInfo.drop_id },
  });

  const metadata = drop.drop_config.nft_keys_config.token_metadata;
  const extra: TicketMetadataExtra = JSON.parse(metadata.extra!);

  return {
    artwork: metadata.artwork,
    description: metadata.description,
    drop,
    extra: extra,
    publicKey,
    secretKey,
    title: metadata.title || 'General Admission',
    usesRemaining: keyInfo.uses_remaining || 0,
  };
}
