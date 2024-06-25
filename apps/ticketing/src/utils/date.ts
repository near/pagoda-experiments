import { EventDetails } from './types';

export function parseEventDate(event: EventDetails) {
  if (event.startTime) {
    return new Date(`${event.date} ${event.startTime}`);
  }
  return new Date(event.date);
}

export function displayEventDate(event: EventDetails) {
  // Display event date consistently regardless of device's timezone
  // YYYY-MM-DD HH:MM => { date: "3/18/24", time:"11:00 AM - 1:00PM" }

  let dateSegments = event.date.split('-');
  const year = dateSegments[0];
  const month = dateSegments[1];
  const day = dateSegments[2];

  if (!year || !month || !day) return;

  const date = `${month.replace(/^0/, '')}/${day.replace(/^0/, '')}/${year.slice(-2)}`;

  let time: string | undefined = undefined;
  if (event.startTime) {
    time = convertFrom24To12HourTime(event.startTime);
    if (event.endTime) {
      time += ` - ${convertFrom24To12HourTime(event.endTime)}`;
    }
  }

  const dateAndTime = `${date}${time ? ` at ${time}` : ''}`;

  return {
    date,
    dateAndTime,
    time,
  };
}

function convertFrom24To12HourTime(time: string) {
  // 23:30 => 11:30 PM
  // 00:30 => 12:30 AM

  let result: string = '';
  const segments = time.split(':');
  const hours = Number(segments[0]);
  const minutes = Number(segments[1]);

  if (hours > 0 && hours <= 12) {
    result = '' + hours;
  } else if (hours > 12) {
    result = '' + (hours - 12);
  } else if (hours == 0) {
    result = '12';
  }

  result += minutes < 10 ? ':0' + minutes : ':' + minutes;
  result += hours >= 12 ? ' PM' : ' AM';

  return result;
}
