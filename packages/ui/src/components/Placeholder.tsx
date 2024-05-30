import { CSSProperties } from 'react';

import s from './Placeholder.module.scss';

type Props = {
  style?: CSSProperties;
};

export const Placeholder = (props: Props) => {
  return <span className={s.placeholder} {...props} />;
};
