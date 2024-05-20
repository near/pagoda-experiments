import { type ReactNode } from 'react';

import s from './styles.module.scss';

interface Props {
  children: ReactNode;
}

export function DefaultLayout({ children }: Props) {
  return (
    <div className={s.wrapper}>
      <header>Header</header>

      <main className={s.content}>{children}</main>

      <footer>Footer</footer>
    </div>
  );
}
