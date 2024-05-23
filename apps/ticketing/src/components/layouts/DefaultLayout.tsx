import { type ReactNode } from 'react';

import s from './DefaultLayout.module.scss';
import { Footer } from './Footer';
import { Header } from './Header';

type Props = {
  children: ReactNode;
};

export const DefaultLayout = ({ children }: Props) => {
  return (
    <div className={s.wrapper}>
      <Header />

      <main className={s.content}>{children}</main>

      <Footer />
    </div>
  );
};
