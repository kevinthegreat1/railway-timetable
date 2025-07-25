import {DatedRoute, Route, Routes, StationNames, Trains, TrainStops, TrainSummary} from "@/types";
import {ChangeEvent, useState} from "react";
import RouteEntry from "@/components/route-entry";
import uniqby from "lodash.uniqby";
import {getStationCode, getStationName} from "@/utils/station-names";
import {sleep} from "@/utils/sleep";

export type RoutesFormProps = {
  timetableRoute: DatedRoute,
  setTimetableRoute: (timetableRoute: DatedRoute) => void,
  setLoadTrainSummaries: (loading: boolean) => void,
  stationNames: StationNames,
  setTrains: (trains: Trains) => void
}

export function RoutesForm({timetableRoute, setTimetableRoute, setLoadTrainSummaries, stationNames, setTrains}: RoutesFormProps) {
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
    if (!timetableRoute.fromStationCode || !timetableRoute.toStationCode) {
      alert("出发地和目的地不能为空");
      return;
    } else if (isNaN(Date.parse(timetableRoute.date))) {
      alert("日期格式不正确，请使用 YYYY-MM-DD 格式");
      return;
    } else if (Date.parse(timetableRoute.date) < Date.now()) {
      alert("日期不能早于今天");
      return;
    }

    setLoadTrainSummaries(true);
    fetch(`/china-railway/init`).then(() => {
      getTrainsForAllRoutes(timetableRoute.date);
    })
  }

  function getTrainsForAllRoutes(date: string) {
    const promises: Promise<TrainSummary[]>[] = []
    promises.push(...getTrainsForRoute(date, timetableRoute));
    routesToSearch.filter((route, index) => route.fromStationCode && route.toStationCode ? true : alert(`路径${index + 1}的出发地和目的地不能为空`))
      .forEach(route => {
        promises.push(...getTrainsForRoute(date, route));
      });

    Promise.all(promises).then(async routes => {
      const trains: Trains = uniqby(routes.flat(), "train_no").map(trainSummary => ({trainSummary, trainStops: [], enabled: true}));
      setTrains(trains);
      return getTrainsDetails(trains);
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

  async function getTrainsForRouteOneWay(date: string, fromStationCode: string, toStationCode: string): Promise<TrainSummary[]> {
    return await (await fetch(`/china-railway/trains?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStationCode}&leftTicketDTO.to_station=${toStationCode}`)).json();
  }

  async function getTrainsDetails(trains: Trains) {
    for (const train of trains) {
      train.trainStops = await getTrainDetails(train.trainSummary);
      setTrains([...trains]);
      await sleep(500);
    }
  }

  async function getTrainDetails(trainSummary: TrainSummary): Promise<TrainStops> {
    return (await (await fetch(`/china-railway/train-stops?train_no=${trainSummary.train_no}&from_station_telecode=${trainSummary.from_station_telecode}&to_station_telecode=${trainSummary.to_station_telecode}&depart_date=${trainSummary.start_train_date.substring(0, 4)}-${trainSummary.start_train_date.substring(4, 6)}-${trainSummary.start_train_date.substring(6)}`)).json()).data.data;
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
            <button onClick={newRouteToSearch} className="w-8 h-8 rounded-full text-lg bg-sky-200">+</button>
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
