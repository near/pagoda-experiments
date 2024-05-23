import * as Accordion from '@pagoda/ui/src/components/Accordion';
import { Badge } from '@pagoda/ui/src/components/Badge';
import { Button } from '@pagoda/ui/src/components/Button';
import { Checkbox, CheckboxGroup } from '@pagoda/ui/src/components/Checkbox';
import * as Dialog from '@pagoda/ui/src/components/Dialog';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Switch } from '@pagoda/ui/src/components/Switch';
import * as Tabs from '@pagoda/ui/src/components/Tabs';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
import { useDebouncedValue } from '@pagoda/ui/src/hooks/debounce';
import { Horse, Pizza } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useDefaultLayout } from '@/hooks/useLayout';
import { NextPageWithLayout } from '@/types/next';

const Home: NextPageWithLayout = () => {
  const router = useRouter();
  const selectedTab = router.query.tab as string;

  const [switchValue, setSwitchValue] = useState(false);
  const debouncedSwitchValue = useDebouncedValue(switchValue, 300);

  useEffect(() => {
    console.log(debouncedSwitchValue);
  }, [debouncedSwitchValue]);

  return (
    <>
      <Section>
        <Text as="h1">Home</Text>

        <CheckboxGroup aria-label="My Group">
          <Flex as="label" align="center" gap="s">
            <Checkbox type="radio" name="myRadio" value="1" />
            My Checkbox 1
          </Flex>

          <Flex as="label" align="center" gap="s">
            <Checkbox type="radio" name="myRadio" value="2" />
            My Checkbox 2
          </Flex>
        </CheckboxGroup>

        <Switch iconOn={<Horse weight="bold" />} checked={switchValue} onCheckedChange={setSwitchValue} />

        <Flex as="label" align="center">
          Turbo Mode (Label On Right)
          <Switch />
        </Flex>
      </Section>

      <Section>
        <Flex align="center" wrap>
          <Button
            label="Open Toast"
            variant="secondary"
            fill="outline"
            onClick={() => {
              openToast({
                type: 'info',
                title: 'My Error',
                description: 'This is a longer description about the toast. Do you like it?',
                action: () => alert(1),
                actionText: 'Click Me',
              });
            }}
          />

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button label="Open Dialog" variant="secondary" fill="outline" />
            </Dialog.Trigger>

            <Dialog.Content title="My Dialog">
              <Text>Some content here.</Text>
              <Text>More content over there.</Text>
              <Text>Some content here.</Text>
              <Text>More content over there.</Text>
              <Text>Some content here.</Text>
              <Text>More content over there.</Text>
              <Text>Some content here.</Text>
              <Text>More content over there.</Text>
              <Text>Some content here.</Text>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>

        <Flex align="center" wrap>
          <Badge iconLeft={<Horse fill="bold" />} label="My Badge" />
          <Badge label="My Badge" variant="neutral" />
          <Badge label="My Badge" variant="alert" />
          <Badge label="My Badge" variant="success" />
          <Badge label="23" variant="warning" count />
          <Badge label="Click Me" variant="warning" onClick={() => console.log(1)} />
        </Flex>

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

        <Accordion.Root type="multiple">
          <Accordion.Item value="one">
            <Accordion.Trigger>First Section</Accordion.Trigger>

            <Accordion.Content>
              <Text>Content 1</Text>
              <Text>Content 1</Text>
              <Text>Content 1</Text>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="two">
            <Accordion.Trigger>Second Section</Accordion.Trigger>

            <Accordion.Content>
              <Text>Content 2</Text>
              <Text>Content 2</Text>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </Section>
    </>
  );
};

Home.getLayout = useDefaultLayout;

export default Home;
