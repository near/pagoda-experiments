import { handleClientError } from '@near-pagoda/ui';
import { useQuery } from '@tanstack/react-query';

import { useNearStore } from '@/stores/near';
import { KEYPOM_EVENTS_CONTRACT_ID } from '@/utils/config';
import { FunderEventMetadata } from '@/utils/helpers';

export function useEvents(accountId: string | undefined) {
  const viewAccount = useNearStore((store) => store.viewAccount);

  const query = useQuery({
    enabled: !!viewAccount && !!accountId,
    queryKey: ['events', accountId],
    queryFn: async () => {
      try {
        if (!viewAccount) throw new Error('View account has not initialized yet');

        const response = await viewAccount.viewFunction({
          contractId: KEYPOM_EVENTS_CONTRACT_ID,
          methodName: 'get_funder_info',
          args: { account_id: accountId },
        });

        const events = response ? (Object.values(JSON.parse(response.metadata)) as FunderEventMetadata[]) : [];

        return events;
      } catch (error) {
        handleClientError({
          title: 'Failed to load events',
          error,
        });
      }

      return [];
    },
  });

  return query;
}

export function useEvent(accountId: string | undefined, eventId: string | undefined) {
  const viewAccount = useNearStore((store) => store.viewAccount);

  const query = useQuery({
    enabled: !!viewAccount && !!accountId && !!eventId,
    queryKey: ['events', accountId, eventId],
    queryFn: async () => {
      try {
        /*
          NOTE: As of now, we don't have a contract call to fetch a single event.
          For now we have to list all events for an account and find a matching ID
          on the client side.
        */

        if (!viewAccount) throw new Error('View account has not initialized yet');

        const response = await viewAccount.viewFunction({
          contractId: KEYPOM_EVENTS_CONTRACT_ID,
          methodName: 'get_funder_info',
          args: { account_id: accountId },
        });

        const events = response ? (Object.values(JSON.parse(response.metadata)) as FunderEventMetadata[]) : [];
        const event = events.find((ev) => ev.id === eventId);
        if (!event) throw new Error('Event ID not found under publisher account');

        return event;
      } catch (error) {
        handleClientError({
          title: 'Failed to load event',
          description: "We couldn't find the requested event. Please make sure your URL is valid.",
          error,
        });
      }

      return null;
    },
  });

  return query;
}
