import {DateTime, HourMinuteTime} from "@/types/types";

export type CrStationName = {
  pinyinCode: string,
  name: string,
  code: string,
  pinyin: string,
  pinyinInitials: string,
  stationCode: string,
  cityCode: string,
  city: string,
  countryCode: string,
  country: string,
  cityEn: string,
}

export type CrStationNames = CrStationName[];

export type CrTrainSummary = {
  arrive_time: HourMinuteTime,
  end_station_telecode: string,
  from_station_telecode: string,
  lishi: string,
  start_station_telecode: string,
  start_time: HourMinuteTime,
  start_train_date: DateTime,
  station_train_code: string, // Human-readable format of the train number at the departing station
  to_station_telecode: string,
  train_no: string,
}

// These fields are probably given by the API but are currently neither parsed nor used.
// These names are left here as documentation.
export type CrTrainSummaryExtended = CrTrainSummary & {
  controlled_train_flag: string,
  controlled_train_message: string,
  day_difference: string,
  exchange_train_flag: string,
  flag: string,
  from_station_name: string,
  houbu_train_flag: string,
  is_support_card: string,
  location_code: string,
  message: string,
  to_station_name: string,
  yp_ex: string,
  yp_info: string,
  yp_info_cover: string,
  yp_info_coverFlag: string,
}

export type CrTrainStop = {
  arrive_time: HourMinuteTime,
  station_name: string,
  isChina: string,
  start_time: HourMinuteTime,
  stopover_time: string,
  station_no: string,
  country_code: string,
  country_name: string,
  isEnabled: boolean,
}

export type CrTrainStops = CrTrainStop[];

export type CrTrain = {
  trainSummary: CrTrainSummary,
  trainStops: CrTrainStops,
  enabled: boolean
}

export type CrTrains = CrTrain[];
