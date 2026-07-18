import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {HourMinuteTime} from "@/types/types";

dayjs.extend(utc);
dayjs.extend(timezone);

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function unixToHourMinute(timestamp: number, timeZone?: string): HourMinuteTime {
  return millisToHourMinute(timestamp * 1000, timeZone);
}

export function millisToHourMinute(timestamp: number, timeZone?: string): HourMinuteTime {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
  return formatter.format(date) as HourMinuteTime;
}

export function dateToUnix(date: string, timeZone: string): Dayjs {
  return dayjs.tz(date, timeZone);
}
