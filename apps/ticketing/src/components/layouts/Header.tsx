import { Container } from '@pagoda/ui/src/components/Container';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { CalendarDots, Plus, QrCode } from '@phosphor-icons/react';
import Link from 'next/link';

import { AccountDropdown } from '../AccountDropdown';
import s from './Header.module.scss';

export const Header = () => {
  return (
    <header className={s.header}>
      <Container className={s.container}>
        <Link href="/" className={s.logo}>
          <SvgIcon icon={<QrCode weight="duotone" />} size="m" />
          Ticketing
        </Link>

        <div className={s.links}>
          <Link href="/events/new" className={s.link}>
            <SvgIcon icon={<Plus weight="regular" />} />
            <span>Create Event</span>
          </Link>

          <Link href="/events" className={s.link}>
            <SvgIcon icon={<CalendarDots weight="regular" />} />
            <span>Manage Events</span>
          </Link>
        </div>

        <AccountDropdown />
      </Container>
    </header>
  );
};
