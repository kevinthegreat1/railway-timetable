import uniqby from "lodash.uniqby";
import {CrTrains, CrTrainStops, CrTrainSummary} from "@/types/cr-types";
import {DatedRoute, Route, Routes, Trains} from "@/types/types";
import {sleep} from "@/utils/time";
import {fromCrTrain} from "@/utils/train";

export async function getTrainsForAllRoutes(timetableRoute: DatedRoute, routesToSearch: Routes, setTrains: (trains: Trains) => void) {
  const stations = new Set([
    timetableRoute.fromStationCode!,
    timetableRoute.toStationCode!,
    ...routesToSearch.flatMap(route => [route.fromStationCode!, route.toStationCode!])
  ]);
  let trains: CrTrains = [];

  function onTrainSummaries(newTrainSummaries: CrTrainSummary[]) {
    trains.push(...newTrainSummaries.filter(getTrainFilter(stations)).map(trainSummary => ({trainSummary, trainStops: [], enabled: true})));
    trains = uniqby(trains, "trainSummary.train_no");
    setTrains(trains.map(fromCrTrain));
  }

  await getTrainsForRoute(timetableRoute.date, timetableRoute, onTrainSummaries);
  for (const route of routesToSearch.filter((route, index) => route.fromStationCode && route.toStationCode ? true : alert(`路径${index + 1}的出发地和目的地不能为空`))) {
    await getTrainsForRoute(timetableRoute.date, route, onTrainSummaries);
  }

  return getTrainsDetails(trains, setTrains);
}

function getTrainFilter(stations: Set<string>): (train: CrTrainSummary) => boolean {
  return train => stations.has(train.from_station_telecode) && stations.has(train.to_station_telecode);
}

async function getTrainsForRoute(date: string, route: Route, onTrainSummaries: (trainSummaries: CrTrainSummary[]) => void) {
  onTrainSummaries(await getTrainsForRouteOneWay(date, route.fromStationCode!, route.toStationCode!));
  await sleep(500);
  if (route.bothWays) {
    onTrainSummaries(await getTrainsForRouteOneWay(date, route.toStationCode!, route.fromStationCode!));
    await sleep(500);
  }
}

async function getTrainsForRouteOneWay(date: string, fromStationCode: string, toStationCode: string): Promise<CrTrainSummary[]> {
  return await (await fetch(`/china-railway/trains?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStationCode}&leftTicketDTO.to_station=${toStationCode}`)).json();
}

async function getTrainsDetails(trains: CrTrains, setTrains: (trains: Trains) => void) {
  for (const train of trains) {
    train.trainStops = await getTrainDetails(train.trainSummary);
    setTrains(trains.map(fromCrTrain));
    await sleep(500);
  }
}

async function getTrainDetails(trainSummary: CrTrainSummary): Promise<CrTrainStops> {
  return (await (await fetch(`/china-railway/train-stops?train_no=${trainSummary.train_no}&from_station_telecode=${trainSummary.from_station_telecode}&to_station_telecode=${trainSummary.to_station_telecode}&depart_date=${trainSummary.start_train_date.substring(0, 4)}-${trainSummary.start_train_date.substring(4, 6)}-${trainSummary.start_train_date.substring(6)}`)).json()).data.data;
}
