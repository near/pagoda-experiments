import { CSSProperties } from 'react';

import { Card } from './Card';
import s from './Placeholder.module.scss';

type Props = {
  style?: CSSProperties;
};

export const Placeholder = (props: Props) => {
  return <span className={s.placeholder} {...props} />;
};

export const PlaceholderCard = (props: Props) => {
  return (
    <Card {...props}>
      <Placeholder />
      <Placeholder />
      <Placeholder style={{ width: '70%' }} />
    </Card>
  );
};
