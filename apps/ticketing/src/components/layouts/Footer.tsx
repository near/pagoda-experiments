import { Container, Text } from '@near-pagoda/ui';

import NearLogoSvg from '@/svg/near-logo.svg';

import s from './Footer.module.scss';

export const Footer = () => {
  return (
    <footer className={s.footer}>
      <Container className={s.container}>
        <a className={s.logo} href="https://near.org" target="_blank">
          <Text size="text-xs" color="current">
            Powered by
          </Text>
          <NearLogoSvg />
        </a>
      </Container>
    </footer>
  );
};
