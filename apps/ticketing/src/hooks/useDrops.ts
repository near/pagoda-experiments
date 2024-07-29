import { handleClientError } from '@near-pagoda/ui';
import { useQuery } from '@tanstack/react-query';

import { useNearStore } from '@/stores/near';
import { KEYPOM_EVENTS_CONTRACT_ID } from '@/utils/config';
import { EventDrop, TicketMetadataExtra } from '@/utils/helpers';
import { validateDateAndTime } from '@/utils/time';

const DROP_ITEMS_PER_QUERY = 5;

export type DropsByEventId = NonNullable<Awaited<ReturnType<typeof useDrops>>['data']>;

export function useDrops(publisherAccountId: string | undefined) {
  const viewAccount = useNearStore((store) => store.viewAccount);

  const query = useQuery({
    enabled: !!viewAccount && !!publisherAccountId,
    queryKey: ['drops', publisherAccountId],
    queryFn: async () => {
      try {
        /*
          NOTE: We fetch all drops in groups of 5 to avoid a view call panic.
          Each drop contains a decent amount of JSON.
        */

        if (!viewAccount) throw new Error('View account has not initialized yet');

        const numberOfDrops: number = await viewAccount.viewFunction({
          contractId: KEYPOM_EVENTS_CONTRACT_ID,
          methodName: 'get_drop_supply_for_funder',
          args: { account_id: publisherAccountId },
        });

        const totalQueries = Math.ceil(numberOfDrops / DROP_ITEMS_PER_QUERY);
        const pages = Array.from({ length: totalQueries }, (_, index) => index);

        const pagedDrops = await Promise.all(
          pages.map(async (pageIndex) => {
            const drops: EventDrop[] = await viewAccount.viewFunction({
              contractId: KEYPOM_EVENTS_CONTRACT_ID,
              methodName: 'get_drops_for_funder',
              args: {
                account_id: publisherAccountId,
                from_index: (pageIndex * DROP_ITEMS_PER_QUERY).toString(),
                limit: DROP_ITEMS_PER_QUERY,
              },
            });

            const mappedDrops = await Promise.all(
              drops.map(async (drop) => {
                const sold: number = await viewAccount.viewFunction({
                  contractId: KEYPOM_EVENTS_CONTRACT_ID,
                  methodName: 'get_key_supply_for_drop',
                  args: { drop_id: drop.drop_id },
                });

                let extra: TicketMetadataExtra | undefined;

                if (drop.drop_config.nft_keys_config.token_metadata.extra) {
                  extra = JSON.parse(drop.drop_config.nft_keys_config.token_metadata.extra) as TicketMetadataExtra;
                }

                const metadata = drop.drop_config.nft_keys_config.token_metadata;

                const validatedSellThrough = extra?.salesValidThrough
                  ? validateDateAndTime(extra.salesValidThrough)
                  : {
                      message: '',
                      valid: true,
                    };

                return {
                  ...drop,
                  ticket: {
                    title: metadata.title || 'General Admission',
                    description: metadata.description,
                    artwork: metadata.artwork,
                    extra: extra,
                    remaining: Math.max(0, (extra?.maxSupply || 0) - sold),
                    sold,
                    validatedSellThrough,
                  },
                };
              }),
            );

            return mappedDrops;
          }),
        );

        const allDrops = pagedDrops.flat();
        const dropsByEventId: Record<string, typeof allDrops> = {};

        allDrops.forEach((drop) => {
          const eventId = drop.ticket.extra?.eventId;
          if (eventId) {
            dropsByEventId[eventId] ??= [];
            dropsByEventId[eventId]!.push(drop);
          }
        });

        return dropsByEventId;
      } catch (error) {
        handleClientError({
          title: 'Failed to load drops for event',
          error,
        });
      }

      return {};
    },
  });

  return query;
}
