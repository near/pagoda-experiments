import type { ReactElement } from 'react';

import { DefaultLayout } from '@/components/layouts/DefaultLayout';

export function useDefaultLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
}

export function useProducerLayout(page: ReactElement) {
  return <DefaultLayout signInRequired>{page}</DefaultLayout>;
}
