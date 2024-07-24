import { Container } from '@pagoda/ui/src/components/Container';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { CalendarDots, PlusCircle, QrCode } from '@phosphor-icons/react';
import Link from 'next/link';

import { useWalletStore } from '@/stores/wallet';

import { AccountDropdown } from '../AccountDropdown';
import s from './Header.module.scss';

export const Header = () => {
  const account = useWalletStore((store) => store.account);
  return (
    <header className={s.header}>
      <Container className={s.container}>
        <Link href="/" className={s.logo}>
          <SvgIcon icon={<QrCode weight="duotone" />} size="m" />
          Ticketing
        </Link>

        {account && (
          <div className={s.links}>
            <Link href="/events/new" className={s.link}>
              <SvgIcon icon={<PlusCircle weight="regular" />} />
              <span>Create Event</span>
            </Link>

            <Link href="/events" className={s.link}>
              <SvgIcon icon={<CalendarDots weight="regular" />} />
              <span>Manage Events</span>
            </Link>
          </div>
        )}

        <AccountDropdown />
      </Container>
    </header>
  );
};
