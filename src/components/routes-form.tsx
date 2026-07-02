import {ChangeEvent, useState} from "react";
import RouteEntry from "@/components/route-entry";
import {DatedRoute, Route, Routes, StationNames} from "@/types/types";
import {getStationCode, getStationName} from "@/utils/station-names";

export type RoutesFormProps = {
  timetableRoute: DatedRoute,
  setTimetableRoute: (timetableRoute: DatedRoute) => void,
  setLoadTrainSummaries: (loading: boolean) => void,
  stationNames: StationNames,
  loadTrains: (timetableRoute: DatedRoute, routesToSearch: Routes) => void,
}

export function RoutesForm({timetableRoute, setTimetableRoute, setLoadTrainSummaries, stationNames, loadTrains}: RoutesFormProps) {
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
    loadTrains(timetableRoute, routesToSearch);
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
