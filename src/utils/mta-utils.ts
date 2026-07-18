import uniqby from "lodash.uniqby";
import {MtaLeg, MtaTimetableTrains} from "@/types/mta-types";
import {DatedRoute, Route, Routes} from "@/types/types";
import {dateToUnix, sleep} from "@/utils/time";

export async function loadMtaTrains(timetableRoute: DatedRoute, routesToSearch: Routes, setTrains: (trains: MtaTimetableTrains) => void) {
  let trains: MtaTimetableTrains = [];

  async function onTrains(newTrains: MtaTimetableTrains) {
    trains.push(...newTrains);
    trains = uniqby(trains, "leg.train.train_id");
    setTrains(trains);
  }

  await getTrainsForRoute(timetableRoute.date, timetableRoute, onTrains);
  for (const route of routesToSearch.filter((route, index) => route.fromStationCode && route.toStationCode ? true : alert(`路径${index + 1}的出发地和目的地不能为空`))) {
    await getTrainsForRoute(timetableRoute.date, route, onTrains);
  }
}

async function getTrainsForRoute(date: string, route: Route, onTrains: (trains: MtaTimetableTrains) => void) {
  await getTrainsForRouteOneWay(date, route.fromStationCode!, route.toStationCode!, onTrains);
  if (route.bothWays) {
    await getTrainsForRouteOneWay(date, route.toStationCode!, route.fromStationCode!, onTrains);
  }
}

async function getTrainsForRouteOneWay(date: string, fromStationCode: string, toStationCode: string, onTrains: (trains: MtaTimetableTrains) => void) {
  for (let hour = 0; hour < 24; hour += 2) {
    onTrains(await getTrainsForRouteOneWayAt(dateToUnix(date, "America/New_York").add(hour, "hour").unix(), fromStationCode, toStationCode));
    await sleep(500);
  }
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
