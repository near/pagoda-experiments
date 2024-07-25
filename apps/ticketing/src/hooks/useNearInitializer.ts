import { connect, keyStores, Near } from 'near-api-js';
import { useRef } from 'react';
import { useEffect } from 'react';

import { useNearStore } from '@/stores/near';
import { KEYPOM_CONTRACT_ID, NETWORK_ID, NETWORK_NODE_URL } from '@/utils/config';

export function useNearInitializer() {
  const connectPromise = useRef<Promise<Near> | null>(null);
  const setKeyStore = useNearStore((store) => store.setKeyStore);
  const setNear = useNearStore((store) => store.setNear);
  const setViewAccount = useNearStore((store) => store.setViewAccount);

  useEffect(() => {
    const initialize = async () => {
      if (!connectPromise.current) {
        const keyStore = new keyStores.BrowserLocalStorageKeyStore();

        setKeyStore(keyStore);

        connectPromise.current = connect({
          networkId: NETWORK_ID,
          keyStore,
          nodeUrl: NETWORK_NODE_URL,
        });
      }

      const near = await connectPromise.current;
      const viewAccount = await near.account(KEYPOM_CONTRACT_ID);

      setNear(near);
      setViewAccount(viewAccount);
    };

    initialize();
  }, [setNear, setViewAccount, setKeyStore]);
}
