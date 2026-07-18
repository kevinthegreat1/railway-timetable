import {AmtrakStationNames} from "@/types/amtrak-types";
import {CrStationNames} from "@/types/cr-types";
import {MtaStationNames} from "@/types/mta-types";

export type StationNames = AmtrakStationNames | CrStationNames | MtaStationNames;

export type Route = {
  fromStation: string,
  fromStationCode?: string,
  toStation: string,
  toStationCode?: string,
  bothWays: boolean,
}

export type DatedRoute = Route & {
  date: string,
}

export type Routes = Route[];

export type HourMinuteTime = `${number}:${number}`;

export type TrainStop = {
  stationName: string,
  stationNo?: string,
  arriveTime: HourMinuteTime,
  leaveTime: HourMinuteTime,
  stopoverTime?: string,
}

export type TrainStops = TrainStop[];

export type Train = {
  trainId: string,
  trainCode: string,
  originStationCode: string,
  terminalStationCode: string,
  boardStationCode: string,
  alightStationCode: string,
  boardTime: HourMinuteTime,
  alightTime: HourMinuteTime,
  trainStops: TrainStops,
  enabled: boolean,
}

export type Trains = Train[];

export type Station = {
  stationName: string,
  enabled: boolean
}
