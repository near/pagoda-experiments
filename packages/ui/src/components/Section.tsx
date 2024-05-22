import type { CSSProperties, ReactNode } from 'react';

import { ThemeGap } from '../utils/types';
import { Container } from './Container';
import { Flex } from './Flex';
import s from './Section.module.scss';

export type ContainerSize = 'xs' | 's' | 'm' | 'l';

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  gap?: ThemeGap;
  style?: CSSProperties;
};

export const Section = ({ children, className = '', gap = 'l', ...props }: Props) => {
  return (
    <section className={`${s.section} ${className}`} {...props}>
      <Container>
        <Flex stack gap={gap}>
          {children}
        </Flex>
      </Container>
    </section>
  );
};
