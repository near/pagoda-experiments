import AddToAppleWalletSvg from '@/svg/add-to-apple-wallet.svg';

import s from './AddToAppleWallet.module.scss';

type Props = {
  onClick: () => any;
};

export const AddToAppleWallet = ({ onClick }: Props) => {
  return (
    <button className={s.button} type="button" onClick={onClick}>
      <AddToAppleWalletSvg />
    </button>
  );
};
