import {CrTrain} from "@/types/cr-types";
import {MtaStationNames, MtaTimetableTrain} from "@/types/mta-types";
import {Train} from "@/types/types";
import {getStationName} from "@/utils/station-names";

export function isLoaded(train: { trainStops: any[] }) {
  return train.trainStops && train.trainStops.length;
}

export function isEnabled(train: { enabled: boolean }) {
  return train.enabled;
}

export function fromCrTrain(t: CrTrain): Train {
  return ({boardStationCode: t.trainSummary.from_station_telecode, alightStationCode: t.trainSummary.to_station_telecode, trainStops: t.trainStops.map(s => ({stationName: s.station_name})), enabled: t.enabled});
}

export function fromMtaTrain(stationNames: MtaStationNames, t: MtaTimetableTrain): Train {
  return {
    boardStationCode: t.leg.board,
    alightStationCode: t.leg.alight,
    trainStops: t.leg.train.details.stops.map(s => {
      let stationName = getStationName(stationNames, s.code);
      if (!stationName) {
        console.warn(`Station name not found for ${s.code} in stations ${stationNames}`);
      }
      return {stationName};
    }),
    enabled: t.enabled
  };
}
