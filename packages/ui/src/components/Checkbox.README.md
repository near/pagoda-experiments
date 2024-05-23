# Checkbox

```tsx
import { Checkbox } from '@pagoda/ui/src/components/Checkbox';
import { Flex } from '@pagoda/ui/src/components/Flex';

...

<Flex as="label" align="center" gap="s">
  <Checkbox name="myCheckbox" />
  My Checkbox
</Flex>
```

## Radio

```tsx
import { Checkbox, CheckboxGroup } from '@pagoda/ui/src/components/Checkbox';
import { Flex } from '@pagoda/ui/src/components/Flex';

...

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
```
