import type { ReactNode } from 'react';

import s from './Container.module.scss';

export type ContainerSize = 'xs' | 's' | 'm' | 'l';

type Props = {
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
};

export const Container = ({ children, className = '', size = 'l' }: Props) => {
  return (
    <div className={`${s.container} ${className}`} data-size={size}>
      {children}
    </div>
  );
};
