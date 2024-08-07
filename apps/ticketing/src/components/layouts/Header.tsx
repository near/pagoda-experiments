import { Container, SvgIcon } from '@near-pagoda/ui';
import { CalendarDots, PlusCircle, QrCode } from '@phosphor-icons/react';
import Link from 'next/link';

import { useWalletStore } from '@/stores/wallet';

import { AccountDropdown } from '../AccountDropdown';
import s from './Header.module.scss';
import { useRouter } from 'next/router';

export const Header = () => {
  const account = useWalletStore((store) => store.account);
  const router = useRouter();
  const eventRoute = router.pathname.includes('/events');
  const isDisabled = eventRoute ? s.disabled : '';
  console.log('eventRoute', eventRoute);
  return (
    <header className={s.header}>
      <div className={isDisabled}>
        <Container className={s.container}>
          <Link href={'/'} className={s.logo}>
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
          {!account && eventRoute ? null : <AccountDropdown />}
        </Container>
      </div>
    </header>
  );
};
