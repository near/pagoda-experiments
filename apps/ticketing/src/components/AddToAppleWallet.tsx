import AddToAppleWalletSvg from '@/svg/add-to-apple-wallet.svg';

import s from './AddToAppleWallet.module.scss';

export const AddToAppleWallet = () => {
  return (
    <button className={s.button} type="button" onClick={() => console.log('TODO')}>
      <AddToAppleWalletSvg />
    </button>
  );
};
