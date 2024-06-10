import { openToast } from '@pagoda/ui/src/components/Toast';
import { MouseEventHandler } from 'react';

import AddToAppleWalletSvg from '@/svg/add-to-apple-wallet.svg';

import s from './AddToAppleWallet.module.scss';

type Props = {
  href: string;
};

export const AddToAppleWallet = ({ href }: Props) => {
  const onClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    /*
      The Brave browser on iOS currently doesn't support adding multiple passes at once (pkpasses vs pkpass). 
      There's also no way to distinguish between iOS Brave and iOS Safari unfortunately. After a couple hours 
      of research and experimenting, it seems like there's nothing we can do to improve the UX on iOS Brave 
      (as of July 7th 2024). "isSafari" will evaluate as true for iOS Brave browsers - meaning they won't get 
      a warning tooltip and instead they'll get a modal asking if they'd like to download a file - the 
      file is useless unfortunately. Oddly enough, iOS Chrome works totally fine.
    */

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!isSafari) {
      event.preventDefault();
      event.stopPropagation();

      openToast({
        type: 'error',
        title: "Your browser doesn't support this feature",
        description: 'Please switch to the Safari browser on your Apple device and try again.',
      });
    }
  };

  return (
    <a className={s.button} type="button" onClick={onClick} href={href} download>
      <AddToAppleWalletSvg />
    </a>
  );
};
