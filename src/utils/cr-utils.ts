import uniqby from "lodash.uniqby";
import {CrTrains, CrTrainStops, CrTrainSummary} from "@/types/cr-types";
import {DatedRoute, Route, Routes, Trains} from "@/types/types";
import {sleep} from "@/utils/time";
import {fromCrTrain} from "@/utils/train";

export function getTrainsForAllRoutes(timetableRoute: DatedRoute, routesToSearch: Routes, setTrains: (trains: Trains) => void) {
  const promises: Promise<CrTrainSummary[]>[] = [];
  promises.push(...getTrainsForRoute(timetableRoute.date, timetableRoute));
  routesToSearch.filter((route, index) => route.fromStationCode && route.toStationCode ? true : alert(`路径${index + 1}的出发地和目的地不能为空`))
    .forEach(route => {
      promises.push(...getTrainsForRoute(timetableRoute.date, route));
    });

  Promise.all(promises).then(async routes => {
    const trains: CrTrains = uniqby(routes.flat(), "train_no").map(trainSummary => ({trainSummary, trainStops: [], enabled: true}));
    setTrains(trains.map(fromCrTrain));
    return getTrainsDetails(trains, setTrains);
  });
}

function getTrainsForRoute(date: string, route: Route) {
  const forward = getTrainsForRouteOneWay(date, route.fromStationCode!, route.toStationCode!);
  if (route.bothWays) {
    const backward = getTrainsForRouteOneWay(date, route.toStationCode!, route.fromStationCode!);
    return [forward, backward];
  }
  return [forward];
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
