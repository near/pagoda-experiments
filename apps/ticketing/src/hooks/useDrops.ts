import { handleClientError } from '@pagoda/ui/src/utils/error';
import { useQuery } from '@tanstack/react-query';

import { useNearStore } from '@/stores/near';
import { KEYPOM_EVENTS_CONTRACT_ID } from '@/utils/common';
import { EventDrop, TicketMetadataExtra } from '@/utils/helpers';

const DROP_ITEMS_PER_QUERY = 5;

export function useDrops(accountId: string | undefined) {
  const viewAccount = useNearStore((store) => store.viewAccount);

  const query = useQuery({
    enabled: !!viewAccount && !!accountId,
    queryKey: ['drops', accountId],
    queryFn: async () => {
      try {
        /*
          NOTE: We fetch all drops in groups of 5 to avoid a view call panic.
          Each drop contains a decent amount of JSON.
        */

        const numberOfDrops: number = await viewAccount!.viewFunction({
          contractId: KEYPOM_EVENTS_CONTRACT_ID,
          methodName: 'get_drop_supply_for_funder',
          args: { account_id: accountId },
        });

        const totalQueries = Math.ceil(numberOfDrops / DROP_ITEMS_PER_QUERY);
        const pages = Array.from({ length: totalQueries }, (_, index) => index);

        const pagedDrops = await Promise.all(
          pages.map(async (pageIndex) => {
            const drops: EventDrop[] = await viewAccount!.viewFunction({
              contractId: KEYPOM_EVENTS_CONTRACT_ID,
              methodName: 'get_drops_for_funder',
              args: {
                account_id: accountId,
                from_index: (pageIndex * DROP_ITEMS_PER_QUERY).toString(),
                limit: DROP_ITEMS_PER_QUERY,
              },
            });

            const mappedDrops = drops.map((drop) => {
              let extra: TicketMetadataExtra | undefined;

              if (drop.drop_config.nft_keys_config.token_metadata.extra) {
                extra = JSON.parse(drop.drop_config.nft_keys_config.token_metadata.extra) as TicketMetadataExtra;
              }

              return {
                ...drop,
                extra: extra,
              };
            });

            return mappedDrops;
          }),
        );

        const allDrops = pagedDrops.flat();
        const dropsByEventId: Record<string, typeof allDrops> = {};

        allDrops.forEach((drop) => {
          const eventId = drop.extra?.eventId;
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
