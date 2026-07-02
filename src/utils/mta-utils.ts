import {MtaLeg, MtaTimetableTrains} from "@/types/mta-types";
import {DatedRoute, Routes} from "@/types/types";

export function loadMtaTrains(timetableRoute: DatedRoute, routesToSearch: Routes, setTrains: (trains: MtaTimetableTrains) => void) {
  fetch(`https://backend-unified.mylirr.org/plan?from=${timetableRoute.fromStationCode!}&to=${timetableRoute.toStationCode!}&fares=ALL&time=${Math.floor(new Date(timetableRoute.date).getTime() / 1000)}&arrive_by=false`, {headers: {"Accept-Version": "3.0"}}).then(async response => {
    setTrains((await response.json()).trips.flatMap((trip: { legs: MtaLeg[] }) => trip.legs).map((leg: MtaLeg) => ({leg, enabled: true})));
  });
}
