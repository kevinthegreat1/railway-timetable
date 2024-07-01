import {DatedRoute, Route, Routes, StationNames, Trains, TrainSummary} from "@/types";
import {ChangeEvent, useState} from "react";
import {RequestConfigTrainsToday, requestConfigTrainsToday} from "@/utils/cr-trains-request-config";
import {RequestDataTrains, requestDataTrainsOtherDay, requestDataTrainsToday} from "@/utils/cr-trains-request-data";
import RouteEntry from "@/components/route-entry";
import uniqby from "lodash.uniqby";
import {getStationCode, getStationName} from "@/utils/station-names";
import {sleep} from "@/utils/sleep";

export type RoutesFormProps = {
  setLoadingTrainSummaries: (loading: boolean) => void,
  stationNames: StationNames,
  setTrainSummaries: (trainSummaries: TrainSummary[]) => void,
  setTrains: (trains: Trains) => void
}

export function RoutesForm({setLoadingTrainSummaries, stationNames, setTrainSummaries, setTrains}: RoutesFormProps) {
  const [timetableRoute, setTimetableRoute] = useState<DatedRoute>({bothWays: true, date: new Date().toISOString().split('T')[0]} as DatedRoute);
  const [routesToSearch, setRoutesToSearch] = useState<Routes>([{bothWays: true} as Route]);

  function getStationTextCallback(toStation: boolean, index: number) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const stationName = e.target.value;
      const stationCode = getStationCode(stationNames, stationName);
      if (index < 0) {
        if (!toStation) {
          setTimetableRoute({...timetableRoute, fromStation: stationName, fromStationCode: stationCode});
        } else {
          setTimetableRoute({...timetableRoute, toStation: stationName, toStationCode: stationCode});
        }
      } else {
        const newRoutesToSearch = [...routesToSearch];
        if (!toStation) {
          newRoutesToSearch[index].fromStation = stationName;
          newRoutesToSearch[index].fromStationCode = stationCode;
        } else {
          newRoutesToSearch[index].toStation = stationName;
          newRoutesToSearch[index].toStationCode = stationCode;
        }
        setRoutesToSearch(newRoutesToSearch);
      }
    }
  }

  function dateCallback(e: ChangeEvent<HTMLInputElement>) {
    setTimetableRoute({...timetableRoute, date: e.target.value});
  }

  function newRouteToSearch() {
    setRoutesToSearch([...routesToSearch, {bothWays: true} as Route])
  }

  function getBothWaysCallback(index: number) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      if (index < 0) {
        setTimetableRoute({...timetableRoute, bothWays: e.target.checked});
      } else {
        const newRoutesToSearch = [...routesToSearch];
        newRoutesToSearch[index].bothWays = e.target.checked;
        setRoutesToSearch(newRoutesToSearch);
      }
    }
  }

  function submitRoutes() {
    setLoadingTrainSummaries(true);
    const date = timetableRoute.date.replaceAll('-', '');
    if (date === new Date().toISOString().split('T')[0].replaceAll('-', '')) {
      getTrainsForAllRoutes("com.cars.otsmobile.trainTimeTable.queryCurrentDayLeftTicket", requestConfigTrainsToday, requestDataTrainsToday, date);
    } else {
      getTrainsForAllRoutes("com.cars.otsmobile.queryLeftTicket", {} as RequestConfigTrainsToday, requestDataTrainsOtherDay, date);
    }
  }

  function getTrainsForAllRoutes(operationType: string, requestConfig: RequestConfigTrainsToday, requestData: RequestDataTrains, date: string) {
    if (!timetableRoute.fromStationCode || !timetableRoute.toStationCode) {
      alert("出发地和目的地不能为空");
      return;
    }
    requestData[0].train_date = date;

    const promises = []
    promises.push(...getTrainsForRoute(operationType, requestConfig, requestData, timetableRoute));
    routesToSearch.filter((route, index) => route.fromStationCode && route.toStationCode ? true : alert(`路径${index + 1}的出发地和目的地不能为空`))
      .forEach(route => {
        promises.push(...getTrainsForRoute(operationType, requestConfig, requestData, route));
      });

    Promise.all(promises).then(async routes => {
      const trainSummaries = uniqby((await Promise.all(routes.map(route => route.result.ticketResult))).flat(), "train_no");
      setTrainSummaries(trainSummaries);
      return getTrainsDetails(trainSummaries);
    });
  }

  function getTrainsForRoute(operationType: string, requestConfig: RequestConfigTrainsToday, requestData: [{ train_date: string; from_station: string; to_station: string }], timetableRoute: Route) {
    const forward = getTrainsForRouteOneWay(operationType, requestConfig, requestData, timetableRoute.fromStationCode!, timetableRoute.toStationCode!);
    if (timetableRoute.bothWays) {
      const backward = getTrainsForRouteOneWay(operationType, requestConfig, requestData, timetableRoute.toStationCode!, timetableRoute.fromStationCode!);
      return [forward, backward];
    }
    return [forward];
  }

  async function getTrainsForRouteOneWay(operationType: string, requestConfig: RequestConfigTrainsToday, requestData: RequestDataTrains, fromStationCode: string, toStationCode: string) {
    requestData[0].from_station = fromStationCode;
    requestData[0].to_station = toStationCode;
    return await (await fetch(`/china-railway/trains?operationType=${operationType}&requestData=${encodeURIComponent(JSON.stringify(requestData))}`, requestConfig)).json();
  }

  async function getTrainsDetails(trains: TrainSummary[]) {
    const promises = [];
    for (const train of trains) {
      promises.push(getTrainDetails(train));
      await sleep(500);
    }
    Promise.all(promises).then(trains => setTrains(trains.map(train => train.data.data)));
  }

  async function getTrainDetails(train: TrainSummary) {
    return await (await fetch(`/china-railway/train-stops?train_no=${train.train_no}&from_station_telecode=${train.from_station_telecode}&to_station_telecode=${train.to_station_telecode}&depart_date=${train.start_train_date.substring(0, 4)}-${train.start_train_date.substring(4, 6)}-${train.start_train_date.substring(6)}`)).json();
  }

  return (
    <div className="flex flex-col items-stretch justify-between p-4">
      <div className="m-4 px-4 divide-y rounded-3xl bg-sky-100 divide-blue-200">
        <div className="py-4 text-center text-xl">路线</div>
        <div className="py-2">
          <RouteEntry
            fromStationText={timetableRoute.fromStation} fromStationTextCallback={getStationTextCallback(false, -1)} fromStationName={getStationName(stationNames, timetableRoute.fromStationCode)}
            toStationText={timetableRoute.toStation} toStationTextCallback={getStationTextCallback(true, -1)} toStationName={getStationName(stationNames, timetableRoute.toStationCode)}
            date={timetableRoute.date} dateCallback={dateCallback} bothWays={timetableRoute.bothWays} bothWaysCallback={getBothWaysCallback(-1)}/>
        </div>
      </div>
      <ul className="m-4 px-4 divide-y rounded-3xl bg-sky-100 divide-blue-200">
        <li className="py-4 flex items-center">
          <div className="grow basis-0"></div>
          <div className="text-xl">路径</div>
          <div className="grow basis-0 flex justify-end">
            <button onClick={newRouteToSearch} className="w-8 h-8 rounded-full text-lg bg-sky-200">⊕</button>
          </div>
        </li>
        {routesToSearch.map((route, index) =>
          <li key={index} className="py-2"><RouteEntry
            fromStationText={route.fromStation} fromStationTextCallback={getStationTextCallback(false, index)} fromStationName={getStationName(stationNames, route.fromStationCode)}
            toStationText={route.toStation} toStationTextCallback={getStationTextCallback(true, index)} toStationName={getStationName(stationNames, route.toStationCode)}
            bothWays={route.bothWays} bothWaysCallback={getBothWaysCallback(index)}
          /></li>
        )}
      </ul>
      <button onClick={submitRoutes} className="self-center px-6 py-2 rounded-full text-lg bg-sky-200">生成</button>
    </div>
  )
}