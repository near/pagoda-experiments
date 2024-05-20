import type { CSSProperties, ReactNode } from 'react';

import type { Align, Justify, Stack, ThemeGap } from '../types';
import s from './Flex.module.scss';

type Props = {
  align?: Align;
  children: ReactNode;
  className?: string;
  gap?: ThemeGap;
  gapPhone?: ThemeGap;
  gapTablet?: ThemeGap;
  id?: string;
  justify?: Justify;
  stack?: Stack;
  stretch?: boolean;
  style?: CSSProperties;
  wrap?: boolean;
};

export const Flex = ({
  align,
  children,
  className = '',
  gap = 'm',
  gapPhone,
  gapTablet,
  justify,
  stack,
  stretch,
  wrap,
  ...props
}: Props) => {
  return (
    <div
      className={`${s.flex} ${className}`}
      data-align={align}
      data-gap={gap}
      data-gap-phone={gapPhone}
      data-gap-tablet={gapTablet}
      data-justify={justify}
      data-stack={stack}
      data-stretch={stretch}
      data-wrap={wrap}
      {...props}
    >
      {children}
    </div>
  );
};
