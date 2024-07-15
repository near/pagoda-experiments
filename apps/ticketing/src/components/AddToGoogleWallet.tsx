import { usePurchasedTickets } from '@/hooks/usePurchasedTickets';
import AddToGoogleWalletSvg from '@/svg/add-to-google-wallet.svg';
import { stringifyEventDataForWallet } from '@/utils/wallet';

import s from './AddToGoogleWallet.module.scss';

type Props = {
  data: ReturnType<typeof usePurchasedTickets>['data'];
};

export const AddToGoogleWallet = ({ data }: Props) => {
  const href = `/api/google-wallet/generate-event-pass?data=${stringifyEventDataForWallet(data)}`;

  return (
    <a className={s.button} type="button" href={href} target="_blank">
      <AddToGoogleWalletSvg />
    </a>
  );
};
