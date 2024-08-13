import { DateTime } from 'luxon';

import { DateAndTimeInfo } from './helpers';

export const validateDateAndTime = (
  requiredDateAndTime: DateAndTimeInfo,
  checkEventOver = false,
): { valid: boolean; message: string } => {
  let message = '';
  let valid = true;
  const requiredInfo = requiredDateAndTime.valueOf();

  if (typeof requiredInfo === 'object') {
    const requiredInfoObj = requiredInfo as DateAndTimeInfo;
    const { valid: startValid, message: startMessage } = validateStartDateAndTime(requiredInfoObj);

    if (!startValid) {
      // If we're checking for event over, we only need to verify that the single day events haven't closed
      if (checkEventOver) {
        if (startMessage === `Ticket sales have closed`) {
          valid = false;
          message = startMessage;
        }
      } // Otherwise, we should just set the valid normally since it wasn't valid
      else {
        valid = false;
        message = startMessage;
      }
    }

    const { valid: endValid, message: endMessage } = validateEndDateAndTime(requiredInfoObj);
    if (!endValid) {
      message = endMessage;
      valid = false;
    }
  }
  return { valid, message };
};

const validateStartDateAndTime = (requiredDateAndTime: DateAndTimeInfo): { valid: boolean; message: string } => {
  // Get the current DateTime
  const now = DateTime.now();
  const nowDateOnly = now.startOf('day');

  // Normalize the start and end dates to midnight for date comparisons
  const requiredStartDate = DateTime.fromMillis(requiredDateAndTime.startDate).startOf('day');

  // Check the date range first
  if (nowDateOnly < requiredStartDate) {
    return { valid: false, message: `Ticket sales open ${dateAndTimeToText(requiredDateAndTime)}` };
  }

  // If it's the start date, check the start time
  if (nowDateOnly.equals(requiredStartDate) && requiredDateAndTime.startTime) {
    const startTimeMinutes = getTimeAsMinutes(requiredDateAndTime.startTime);
    const currentMinutes = now.hour * 60 + (now.minute as number);
    if (currentMinutes < startTimeMinutes) {
      return {
        valid: false,
        message: `Ticket sales open ${dateAndTimeToText(requiredDateAndTime)}`,
      };
    }
  }

  // If it's the start date, check the end time (only if it's a 1 day ticket)
  if (
    nowDateOnly.equals(requiredStartDate) &&
    requiredDateAndTime.endTime &&
    requiredDateAndTime.endDate === undefined
  ) {
    const endTimeMinutes = getTimeAsMinutes(requiredDateAndTime.endTime);
    const currentMinutes = now.hour * 60 + (now.minute as number);
    if (currentMinutes > endTimeMinutes) {
      return {
        valid: false,
        message: `Ticket sales have closed`,
      };
    }
  }

  return {
    valid: true,
    message: ``,
  };
};

const validateEndDateAndTime = (requiredDateAndTime: DateAndTimeInfo): { valid: boolean; message: string } => {
  // Get the current DateTime
  const now = DateTime.now();
  const nowDateOnly = now.startOf('day');

  // Normalize the start and end dates to midnight for date comparisons
  const requiredEndDate = requiredDateAndTime.endDate
    ? DateTime.fromMillis(requiredDateAndTime.endDate).endOf('day') // Use end of the day for end date
    : null;

  // Check the date range first
  if (requiredEndDate && nowDateOnly > requiredEndDate) {
    return { valid: false, message: `Ticket sales have closed` };
  }

  // If it's the end date, check the end time
  if (requiredEndDate && nowDateOnly.equals(requiredEndDate.startOf('day')) && requiredDateAndTime.endTime) {
    const endTimeMinutes = getTimeAsMinutes(requiredDateAndTime.endTime);
    const currentMinutes = now.hour * 60 + (now.minute as number);
    if (currentMinutes > endTimeMinutes) {
      return { valid: false, message: `Ticket sales have closed` };
    }
  }

  return { valid: true, message: `` };
};

export const dateAndTimeToText = (date: DateAndTimeInfo, placeholder = '') => {
  if (!date.startDate) {
    return placeholder;
  }

  let formattedDate = '';
  let timeZone = '';

  const start = new Date(date.startDate);
  const startYear = start.getFullYear();
  const startMonth = start.toLocaleDateString(undefined, { month: 'short' });
  const startDay = start.toLocaleDateString(undefined, { day: 'numeric' });
  // Extract the time zone from the start date and use it at the end
  timeZone = start.toLocaleDateString(undefined, { timeZoneName: 'short' }).split(', ').pop() || '';

  formattedDate = `${startMonth} ${startDay}`;
  if (date.startTime) {
    formattedDate += ` at ${date.startTime}`;
  }

  if (!date.endDate && date.endTime) {
    formattedDate += ` ends ${date.endTime}`;
  }

  // Only add end date information if it exists
  if (date.endDate) {
    const end = new Date(date.endDate);
    const endYear = end.getFullYear();
    const endMonth = end.toLocaleDateString(undefined, { month: 'short' });
    const endDay = end.toLocaleDateString(undefined, { day: 'numeric' });

    // Check if the year is the same for start and end date to decide if it should be repeated.
    const sameYear = startYear === endYear;

    // Check if start and end date are the same to avoid repeating the same date
    if (date.startDate !== date.endDate) {
      formattedDate += ` - ${endMonth} ${endDay}`;
      if (date.endTime) {
        formattedDate += ` at ${date.endTime}`;
      }
      // Append the year at the end only if start and end years are different
      if (!sameYear) {
        formattedDate += `, ${startYear} - ${endYear}`;
      }
    } else if (date.endTime) {
      // If it's the same day but with an end time
      formattedDate += ` - ${date.endTime}`;
    }
  }

  // Append the year if only start date is available or if start and end are in the same year
  if (
    !date.endDate ||
    start.getFullYear() === (date.endDate ? new Date(date.endDate).getFullYear() : start.getFullYear())
  ) {
    formattedDate += `, ${startYear}`;
  }

  // Append the time zone at the end
  formattedDate += `, ${timeZone}`;

  return formattedDate;
};

const getTimeAsMinutes = (timeString: string) => {
  // Assuming the format is 'hh:mm', e.g., '14:00' would be 2pm
  const time = DateTime.fromFormat(timeString, 'hh:mm');
  return time.hour * 60 + (time.minute as number);
};

export const timeToMilliseconds = (time: string): number => {
  const dateTime = DateTime.fromFormat(time, 'HH:mm');

  return dateTime.diff(DateTime.fromObject({ hour: 0, minute: 0 })).toMillis();
};
