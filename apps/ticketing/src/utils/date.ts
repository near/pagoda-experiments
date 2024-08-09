import type { FunderEventMetadata } from './helpers';

export function parseEventDate(event: FunderEventMetadata) {
  const date = new Date(event.date.startDate);

  if (event.date.startTime) {
    const segments = event.date.startTime.split(':');
    const hours = Number(segments[0]);
    const minutes = Number(segments[1]);
    date.setHours(hours);
    date.setMinutes(minutes);
  }

  return date;
}

export function displayEventDate(event: FunderEventMetadata) {
  const date = new Date(event.date.startDate).toLocaleDateString(undefined, {
    dateStyle: 'short',
  });

  let time: string | undefined = undefined;
  if (event.date.startTime) {
    time = convertFrom24To12HourTime(event.date.startTime);
    if (event.date.endTime) {
      time += ` - ${convertFrom24To12HourTime(event.date.endTime)}`;
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
  if (typeof time !== 'string') return;
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
