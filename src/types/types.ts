import {CrStationNames} from "@/types/cr-types";
import {MtaStationNames} from "@/types/mta-types";

export type StationNames = CrStationNames | MtaStationNames;

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

export type TrainStop = {
  stationName?: string,
}

export type TrainStops = TrainStop[];

export type Train = {
  boardStationCode: string,
  alightStationCode: string,
  trainStops: TrainStops,
  enabled: boolean,
}

export type Trains = Train[];

export type Station = {
  stationName: string,
  enabled: boolean
}
