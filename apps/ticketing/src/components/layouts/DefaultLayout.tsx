import { Button, Container, Flex, Section, Text } from '@near-pagoda/ui';
import { Wallet } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { useWalletStore } from '@/stores/wallet';

import s from './DefaultLayout.module.scss';
import { Footer } from './Footer';
import { Header } from './Header';

type Props = {
  children: ReactNode;
  signInRequired?: boolean;
};

export const DefaultLayout = ({ children, signInRequired }: Props) => {
  const account = useWalletStore((store) => store.account);
  const hasResolved = useWalletStore((store) => store.hasResolved);
  const needsToSignIn = signInRequired && hasResolved && !account;
  const showFastAuthModal = useWalletStore((store) => store.showFastAuthModal);

  return (
    <div className={s.wrapper}>
      <Header />

      <main className={s.content}>
        {needsToSignIn ? (
          <>
            <Section grow="available">
              <Container size="xs" style={{ margin: 'auto' }}>
                <Flex stack gap="l">
                  <Text as="h2">Sign In</Text>
                  <Text>Please connect your wallet to begin creating and managing your own events.</Text>
                  <Button
                    variant="affirmative"
                    iconLeft={<Wallet />}
                    label="Connect Wallet"
                    onClick={showFastAuthModal}
                  />
                </Flex>
              </Container>
            </Section>
          </>
        ) : (
          children
        )}
      </main>

      <Footer />
    </div>
  );
};
