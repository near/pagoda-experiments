import { stringToNumber } from './number';

const dollarFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

export function formatDollar(number: string | number | null | undefined, round?: boolean) {
  let parsedNumber = number ?? 0;

  if (typeof parsedNumber === 'number') {
    parsedNumber = parsedNumber;
  } else if (typeof parsedNumber === 'string') {
    parsedNumber = stringToNumber(parsedNumber) ?? 0;
  }

  if (round) {
    const dollars = dollarFormatter.format(Math.round(parsedNumber));
    return dollars.split('.')[0]!;
  }

  return dollarFormatter.format(parsedNumber);
}

export function formatTicketPrice(priceFiat: string | number | undefined | null) {
  if (priceFiat && priceFiat !== '0') {
    return formatDollar(priceFiat);
  }

  return 'Free';
}
