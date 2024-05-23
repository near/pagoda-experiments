import { Button } from '@pagoda/ui/src/components/Button';
import { Container } from '@pagoda/ui/src/components/Container';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { QrCode } from '@phosphor-icons/react';
import Link from 'next/link';

import s from './Header.module.scss';

export const Header = () => {
  return (
    <header className={s.header}>
      <Container className={s.container}>
        <Link href="/" className={s.logo}>
          <SvgIcon icon={<QrCode weight="duotone" />} size="m" />
          Ticketing
        </Link>

        <Link href="/events" className={s.link}>
          <span>Manage </span>Events
        </Link>

        <Link href="/tickets" className={s.link}>
          <span>Your </span>Tickets
        </Link>

        <Button size="small" label="Sign In" />
      </Container>
    </header>
  );
};
