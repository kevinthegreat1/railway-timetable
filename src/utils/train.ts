import {kmeans} from "ml-kmeans";
import {CrTrain} from "@/types/cr-types";
import {MtaTimetableTrain} from "@/types/mta-types";
import {MinuteTimestamp, StationNames, Train, Trains, TrainStop} from "@/types/types";
import {getStationName} from "@/utils/station-names";
import {minuteTimestampToUnix, unixToMinuteTimestamp} from "@/utils/time";

export function isLoaded(train: { trainStops: any[] }) {
  return train.trainStops && train.trainStops.length;
}

export function isEnabled(train: { enabled: boolean }) {
  return train.enabled;
}

export function getStopsOnRoute(route: string[], train: Train) {
  return route
    .map(stationName => train.trainStops.find(s => s.stationName === stationName))
    .filter(s => !!s);
}

export function isUp(route: string[], train: Train): boolean {
  const stopsOnRoute = getStopsOnRoute(route, train);
  return stopsOnRoute.length !== 0 && stopsOnRoute[0].stationNo > stopsOnRoute.at(-1)!.stationNo;
}

export function isDown(route: string[], train: Train): boolean {
  const stopsOnRoute = getStopsOnRoute(route, train);
  return stopsOnRoute.length !== 0 && stopsOnRoute[0].stationNo < stopsOnRoute.at(-1)!.stationNo;
}

export function clusterTrains(route: string[], trains: Trains) {
  const trainsData = trains.map((train) => {
    const stopsOnRoute = getStopsOnRoute(route, train);
    if (stopsOnRoute.length < 2) return;

    const routeSegment = route.slice(
      route.indexOf(stopsOnRoute[0]?.stationName),
      route.lastIndexOf(stopsOnRoute.at(-1)!.stationName) + 1
    );
    if (routeSegment.length < 2) return;

    const routeMinutes = Math.max(
      minuteTimestampToUnix(stopsOnRoute.at(-1)!.arriveTime).unix() - minuteTimestampToUnix(stopsOnRoute[0].leaveTime).unix(),
      minuteTimestampToUnix(stopsOnRoute[0].arriveTime).unix() - minuteTimestampToUnix(stopsOnRoute.at(-1)!.leaveTime).unix()
    ) / 60;

    return {train, clusterData: [stopsOnRoute.length / routeSegment.length, routeMinutes / (routeSegment.length - 1)]};
  }).filter(trainsData => !!trainsData);

  if (!trainsData.length) return;

  const {clusters, centroids} = kmeans(normalizeTimeRatio(trainsData), 3, {
    initialization: [
      [0.2, 0.2],
      [0.5, 0.5],
      [0.8, 0.8]
    ]
  });
  const centroidsRankToIndex = centroids
    .map((c, index) => ({index, stops: c[0]}))
    .sort((a, b) => b.stops - a.stops)
    .map(({index}) => index)
  const colors = ["#0000FF", "#00C000", "#FF0000"]

  trainsData.forEach(({train}, index) => train.clusterColor = colors[centroidsRankToIndex.indexOf(clusters[index])]);
  return trainsData;
}

function normalizeTimeRatio(trainsData: { train: Train; clusterData: number[] }[]) {
  const timeRatios = trainsData.map(d => d.clusterData[1]);
  const timeRatioMin = Math.min(...timeRatios), timeRatioMax = Math.max(...timeRatios);
  const timeRatioRange = (timeRatioMax - timeRatioMin) || 1;
  return trainsData.map(({clusterData}) => [
    clusterData[0],
    (clusterData[1] - timeRatioMin) / timeRatioRange,
  ]);
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
