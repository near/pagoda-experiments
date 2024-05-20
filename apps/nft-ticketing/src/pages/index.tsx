import { Button } from '@pagoda/ui/src/components/Button';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { Horse } from '@phosphor-icons/react';

import { useDefaultLayout } from '@/hooks/useLayout';
import { NextPageWithLayout } from '@/types/next';

const Home: NextPageWithLayout = () => {
  return (
    <Container size="s">
      <Flex stack align="center" gap="l">
        <Text as="h1">Home</Text>

        <Text color="green10" clampLines={2}>
          Some Text afs fads dsf adsf dsfas sdfasdfdsfasd fdsaf asdf f Some Text afs fads dsf adsf dsfas sdfasdfdsfasd
          fdsaf asdf f Some Text afs fads dsf adsf dsfas sdfasdfdsfasd fdsaf asdf f Some Text afs fads dsf adsf dsfas
          sdfasdfdsfasd fdsaf asdf f Some Text afs fads dsf adsf dsfas sdfasdfdsfasd fdsaf asdf fSome Text afs fads dsf
          adsf dsfas sdfasdfdsfasd fdsaf asdf fSome Text afs fads dsf adsf dsfas sdfasdfdsfasd fdsaf asdf fSome Text afs
          fads dsf adsf dsfas sdfasdfdsfasd fdsaf asdf fSome Text afs fads dsf adsf dsfas sdfasdfdsfasd fdsaf asdf fSome
          Text afs fads dsf adsf dsfas sdfasdfdsfasd fdsaf asdf f
        </Text>

        <SvgIcon icon={<Horse weight="duotone" />} color="red10" size="xl" />

        <Button fill="outline" iconLeft={<Horse weight="fill" />} label="Click Me" size="large" />
      </Flex>
    </Container>
  );
};

Home.getLayout = useDefaultLayout;

export default Home;
