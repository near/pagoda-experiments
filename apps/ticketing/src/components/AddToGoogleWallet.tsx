import AddToGoogleWalletSvg from '@/svg/add-to-google-wallet.svg';

import s from './AddToGoogleWallet.module.scss';

type Props = {
  href: string;
};

export const AddToGoogleWallet = ({ href }: Props) => {
  return (
    <a className={s.button} type="button" href={href} target="_blank">
      <AddToGoogleWalletSvg />
    </a>
  );
};
