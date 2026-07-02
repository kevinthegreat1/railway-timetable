import uniqby from "lodash.uniqby";
import {MtaLeg, MtaTimetableTrains} from "@/types/mta-types";
import {DatedRoute, Route, Routes} from "@/types/types";
import {dateToUnix} from "@/utils/time";

export function loadMtaTrains(timetableRoute: DatedRoute, routesToSearch: Routes, setTrains: (trains: MtaTimetableTrains) => void) {
  const promises: Promise<MtaTimetableTrains>[] = [];
  promises.push(...getTrainsForRoute(timetableRoute.date, timetableRoute));
  routesToSearch.filter((route, index) => route.fromStationCode && route.toStationCode ? true : alert(`路径${index + 1}的出发地和目的地不能为空`))
    .forEach(route => {
      promises.push(...getTrainsForRoute(timetableRoute.date, route));
    });

  Promise.all(promises).then(routes => {
    const trains: MtaTimetableTrains = uniqby(routes.flat(), "leg.train.train_id");
    setTrains(trains);
  });
}

function getTrainsForRoute(date: string, route: Route) {
  const forward = getTrainsForRouteOneWay(date, route.fromStationCode!, route.toStationCode!);
  if (route.bothWays) {
    const backward = getTrainsForRouteOneWay(date, route.toStationCode!, route.fromStationCode!);
    return [...forward, ...backward];
  }
  return forward;
}

function getTrainsForRouteOneWay(date: string, fromStationCode: string, toStationCode: string): Promise<MtaTimetableTrains>[] {
  const promises: Promise<MtaTimetableTrains>[] = [];

  for (let hour = 0; hour < 24; hour += 2) {
    promises.push(getTrainsForRouteOneWayAt(dateToUnix(date, "America/New_York").add(hour, "hour").unix(), fromStationCode, toStationCode));
  }

  return promises;
}

async function getTrainsForRouteOneWayAt(unixTime: number, fromStationCode: string, toStationCode: string): Promise<MtaTimetableTrains> {
  return await fetch(`https://backend-unified.mylirr.org/plan?from=${fromStationCode!}&to=${toStationCode!}&fares=ALL&time=${unixTime}&arrive_by=false`, {headers: {"Accept-Version": "3.0"}})
    .then(async response => await response.json())
    .then((json: { trips: { legs: MtaLeg[] }[] }) => {
      return json.trips
        .flatMap(trip => trip.legs)
        .map((leg: MtaLeg) => ({leg, enabled: true}));
    });
}
