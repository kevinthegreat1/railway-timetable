export type MtaStationName = {
  code: string,
  branch: string,
  branch_id: string,
  name: string,
  latitude: number,
  longitude: number
  westName: string,
  eastName: string,
  zone: number,
  exclude: boolean,
  rank: number,
  railroad: string,
  gtfs_stop_id: number,
  locCode: number,
  accessibility: string,
  parkingMapURL: string,
  stationDetailURL: string,
}

export type MtaStationNames = MtaStationName[];

export type MtaTrainStop = {
  code: string,
  sched_time: number,
  act_arrive_time: number,
  act_depart_time: number,
  act_time: number,
  sign_track: string,
  posted: boolean,
  t2s_track: string,
  stop_status: string,
  stop_type: string,
  track_change: boolean,
  local_cancel: boolean,
  bus: boolean,
  occupancy: string,
}

export type MtaTrainStops = MtaTrainStop[];

export type MtaTrainDetails = {
  headsign: string,
  summary: string,
  peak_code: string,
  branch: string,
  branch_id: string,
  stops: MtaTrainStops,
  events: any[],
  direction: string,
  bike_rule: string,
}

export type MtaTrain = {
  train_id: string,
  railroad: string,
  run_date: string,
  train_num: string,
  realtime: boolean,
  details: MtaTrainDetails,
  consist: any,
  location: any,
  status: any,
}

export type MtaLeg = {
  board: string,
  alight: string,
  arrive_time: number,
  destination: string,
  is_shuttle: boolean,
  original_train_no: string,
  gtfs_trip_id: string,
  train: MtaTrain,
}

export type MtaTimetableTrain = {
  leg: MtaLeg,
  enabled: boolean,
}

export type MtaTimetableTrains = MtaTimetableTrain[];
