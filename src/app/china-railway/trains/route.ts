import {NextRequest} from "next/server";
import {CrTrainSummary} from "@/types/cr-types";
import {HourMinuteTime} from "@/types/types";

export async function GET(request: NextRequest) {
  const trainsStringArray: string[] = (await (await fetch(`https://kyfw.12306.cn/otn/leftTicket/queryU?${request.nextUrl.searchParams}&purpose_codes=ADULT`, {headers: request.headers})).json()).data.result;
  const trains = trainsStringArray.map((train): CrTrainSummary => {
    const [, yuDing, train_no, station_train_code, start_station_telecode, end_station_telecode, from_station_telecode, to_station_telecode, start_time, arrive_time, lishi, Y, , start_train_date] = train.split('|');
    return {train_no, station_train_code, start_station_telecode, end_station_telecode, from_station_telecode, to_station_telecode, start_time: start_time as HourMinuteTime, arrive_time: arrive_time as HourMinuteTime, lishi, start_train_date}
  });

  return Response.json(trains);
}
