import { Button } from '@pagoda/ui/src/components/Button';
import * as Dropdown from '@pagoda/ui/src/components/Dropdown';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Gear, User, X } from '@phosphor-icons/react';

import { useWalletStore } from '@/stores/wallet';

export const AccountDropdown = () => {
  const account = useWalletStore((store) => store.account);
  const wallet = useWalletStore((store) => store.wallet);
  const showFastAuthModal = useWalletStore((store) => store.showFastAuthModal);

  if (account) {
    return (
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <Button label={account.accountId} size="small" icon={<User weight="bold" />} />
        </Dropdown.Trigger>

        <Dropdown.Content>
          <Dropdown.Section>
            <Dropdown.SectionHeader>{account.accountId}</Dropdown.SectionHeader>
          </Dropdown.Section>

          <Dropdown.Section>
            <Dropdown.Item href="/account-settings">
              <SvgIcon icon={<Gear weight="regular" />} />
              Account Settings
            </Dropdown.Item>

            <Dropdown.Item onSelect={() => wallet?.signOut()}>
              <SvgIcon icon={<X weight="regular" />} color="red8" />
              Sign Out
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Root>
    );
  }

  return <Button label="Sign In" size="small" onClick={showFastAuthModal} />;
};
