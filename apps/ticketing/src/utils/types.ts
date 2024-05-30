import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<T = any> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type EventDetails = {
  id: number;
  name: string;
  location: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  description?: string;
  imageUrl?: string;
  links?: {
    facebook?: string;
    website?: string;
    x?: string;
    youTube?: string;
  };
  tickets: {
    available: number;
    sold: number;
    total: number;
  };
  ticketPrice?: number;
  ticketQuantityLimit?: number;
};
