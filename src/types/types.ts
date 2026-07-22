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

export type DateTime = `${number}-${number}-${number}`;
export type HourMinuteTime = `${number}:${number}`;
export type MinuteTimestamp = `${DateTime} ${HourMinuteTime}`;
export type MinuteTimestampUnconfirmed = `${DateTime} ${string}`;

export type TrainStop = {
  stationName: string,
  stationNo: number,
  arriveTime: MinuteTimestamp | MinuteTimestampUnconfirmed,
  leaveTime: MinuteTimestamp | MinuteTimestampUnconfirmed,
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
  boardTime: MinuteTimestamp | MinuteTimestampUnconfirmed,
  alightTime: MinuteTimestamp | MinuteTimestampUnconfirmed,
  trainStops: TrainStops,
  clusterColor?: string,
  enabled: boolean,
}

export type Trains = Train[];

export type Station = {
  stationName: string,
  enabled: boolean
}
