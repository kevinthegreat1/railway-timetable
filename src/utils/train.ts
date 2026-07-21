import {CrTrain} from "@/types/cr-types";
import {MtaTimetableTrain} from "@/types/mta-types";
import {MinuteTimestamp, Station, StationNames, Train, TrainStop} from "@/types/types";
import {getStationName} from "@/utils/station-names";
import {unixToMinuteTimestamp} from "@/utils/time";

export function isLoaded(train: { trainStops: any[] }) {
  return train.trainStops && train.trainStops.length;
}

export function isEnabled(train: { enabled: boolean }) {
  return train.enabled;
}

export function isUp(stations: Station[], train: Train): boolean | undefined {
  const stationsTrain = stations
    .map(({stationName}) => train.trainStops.find(s => s.stationName === stationName))
    .filter(s => !!s)

  return stationsTrain.length !== 0 ? stationsTrain[0].stationNo > stationsTrain.at(-1)!.stationNo : undefined;
}

export function fromCrTrain(t: CrTrain): Train {
  const startTrainDate = t.trainSummary.start_train_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
  return ({
    trainId: t.trainSummary.train_no,
    trainCode: t.trainSummary.station_train_code,
    originStationCode: t.trainSummary.start_station_telecode,
    terminalStationCode: t.trainSummary.end_station_telecode,
    boardStationCode: t.trainSummary.from_station_telecode,
    alightStationCode: t.trainSummary.to_station_telecode,
    boardTime: startTrainDate + " " + t.trainSummary.start_time as MinuteTimestamp,
    alightTime: startTrainDate + " " + t.trainSummary.arrive_time as MinuteTimestamp,
    trainStops: t.trainStops.map((s): TrainStop => ({
      stationName: s.station_name.replaceAll(" ", ""),
      stationNo: parseInt(s.station_no),
      arriveTime: startTrainDate + " " + s.arrive_time as MinuteTimestamp,
      leaveTime: startTrainDate + " " + s.start_time as MinuteTimestamp,
      stopoverTime: s.stopover_time,
    })),
    enabled: t.enabled
  });
}

export function fromMtaTrain(stationNames: StationNames, t: MtaTimetableTrain): Train {
  return {
    trainId: t.leg.train.train_id,
    trainCode: t.leg.train.train_num,
    originStationCode: t.leg.train.details.stops[0].code,
    terminalStationCode: t.leg.train.details.stops.at(-1)?.code ?? "",
    boardStationCode: t.leg.board,
    alightStationCode: t.leg.alight,
    boardTime: unixToMinuteTimestamp(t.leg.train.details.stops.find(s => s.code === t.leg.board)!.sched_time, "America/New_York"),
    alightTime: unixToMinuteTimestamp(t.leg.train.details.stops.find(s => s.code === t.leg.alight)!.sched_time, "America/New_York"),
    trainStops: t.leg.train.details.stops.map((s, index): TrainStop => ({
      stationName: getStationName(stationNames, s.code)!,
      stationNo: index + 1,
      arriveTime: unixToMinuteTimestamp(s.sched_time - 60, "America/New_York"),
      leaveTime: unixToMinuteTimestamp(s.sched_time, "America/New_York"),
    })),
    enabled: t.enabled
  };
}
