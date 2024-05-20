import type { ReactNode } from 'react';

import s from './Container.module.scss';

export type ContainerSize = 'xs' | 's' | 'm' | 'l';

type Props = {
  children: ReactNode;
  size?: ContainerSize;
};

export const Container = ({ children, size = 'l' }: Props) => {
  return (
    <div className={s.container} data-size={size}>
      {children}
    </div>
  );
};
