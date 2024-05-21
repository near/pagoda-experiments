import { Container } from '@pagoda/ui/src/components/Container';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import * as Tabs from '@pagoda/ui/src/components/Tabs';
import { Text } from '@pagoda/ui/src/components/Text';
import { Horse, Pizza } from '@phosphor-icons/react';
import { useRouter } from 'next/router';

import { useDefaultLayout } from '@/hooks/useLayout';
import { NextPageWithLayout } from '@/types/next';

const Home: NextPageWithLayout = () => {
  const router = useRouter();
  const selectedTab = router.query.tab as string;

  return (
    <Container size="s">
      <Text as="h1">Home</Text>

      <Tabs.Root value={selectedTab}>
        <Tabs.List>
          <Tabs.Trigger href="?tab=one" value="one">
            <SvgIcon icon={<Horse fill="bold" />} />
            Tab One
          </Tabs.Trigger>

          <Tabs.Trigger href="?tab=two" value="two">
            <SvgIcon icon={<Pizza fill="bold" />} />
            Tab Two
          </Tabs.Trigger>

          <Tabs.Trigger href="?tab=three" value="three">
            Tab Three With No Icon
          </Tabs.Trigger>

          <Tabs.Trigger href="?tab=four" value="four">
            Tab Four With No Icon
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="one">
          <Text>Content one.</Text>
        </Tabs.Content>

        <Tabs.Content value="two">
          <Text>Content two.</Text>
        </Tabs.Content>

        <Tabs.Content value="three">
          <Text>Content three.</Text>
        </Tabs.Content>

        <Tabs.Content value="four">
          <Text>Content four.</Text>
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
};

Home.getLayout = useDefaultLayout;

export default Home;
