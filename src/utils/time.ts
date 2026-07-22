import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {HourMinuteTime, MinuteTimestamp, MinuteTimestampUnconfirmed} from "@/types/types";

dayjs.extend(utc);
dayjs.extend(timezone);

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isMinuteTimestamp(time: MinuteTimestamp | MinuteTimestampUnconfirmed): time is MinuteTimestamp {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(time);
}

export function unixToMinuteTimestamp(timestamp: number, timeZone?: string): MinuteTimestamp {
  return millisToMinuteTimestamp(timestamp * 1000, timeZone);
}

export function millisToMinuteTimestamp(timestamp: number, timeZone?: string): MinuteTimestamp {
  return new Date(timestamp).toLocaleString("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }) as MinuteTimestamp;
}

export function millisToHourMinute(timestamp: number, timeZone?: string): HourMinuteTime {
  return new Date(timestamp).toLocaleString("sv-SE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }) as HourMinuteTime;
}

export function dateToUnix(date: string, timeZone: string): Dayjs {
  return dayjs.tz(date, timeZone);
}

export function minuteTimestampUnconfirmedToUnix(minuteTimestamp: MinuteTimestamp | MinuteTimestampUnconfirmed): Dayjs | undefined {
  return isMinuteTimestamp(minuteTimestamp) ? minuteTimestampToUnix(minuteTimestamp) : undefined;
}

export function minuteTimestampToUnix(minuteTimestamp: MinuteTimestamp): Dayjs {
  return dayjs(minuteTimestamp, "YYYY-MM-DD HH:mm");
}
