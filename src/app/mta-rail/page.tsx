"use client";

import {useEffect, useState} from "react";
import {Loading} from "@/components/loading";
import {RoutesForm} from "@/components/routes-form";
import {MtaStationNames, MtaTimetableTrains} from "@/types/mta-types";
import {DatedRoute, Routes} from "@/types/types";
import {loadMtaTrains} from "@/utils/mta-utils";
import {sortStations} from "@/utils/sort-stations";
import {fromMtaTrain, isLoaded} from "@/utils/train";

export default function TimetablePage() {
  const [stationNames, setStationNames] = useState<MtaStationNames>([]);
  useEffect(() => {
    async function fetchStationNames() {
      const stationNamesResponse = await fetch("https://backend-unified.mylirr.org/infrastructure?language=en", {headers: {"Accept-Version": "3.0"}});
      setStationNames((await stationNamesResponse.json()).stations);
    }

    // noinspection JSIgnoredPromiseFromCall
    fetchStationNames();
  }, []);

  const [timetableRoute, setTimetableRoute] = useState<DatedRoute>({bothWays: true, date: new Date().toISOString().split('T')[0]} as DatedRoute);

  const [trains, setTrains] = useState<MtaTimetableTrains>([]);
  const [generateTimetable, setGenerateTimetable] = useState<boolean>(false);

  const sortedStations = sortStations(stationNames, timetableRoute, trains.map(t => fromMtaTrain(stationNames, t)));

  function loadTrains(timetableRoute: DatedRoute, routesToSearch: Routes) {
    loadMtaTrains(timetableRoute, routesToSearch, setTrains);
  }

  if (generateTimetable) {
    if (trains && trains.map(t => ({trainStops: t.leg.train.details.stops})).every(isLoaded) && sortedStations) {
      return (
        <div/>
      )
    } else {
      return <Loading loadingText={`${trains.map(t => ({trainStops: t.leg.train.details.stops})).filter(isLoaded).length}/${trains.length}列`}/>
    }
  } else {
    return (
      <main className="min-h-screen bg-red-50">
        <RoutesForm timetableRoute={timetableRoute} setTimetableRoute={setTimetableRoute} setLoadTrainSummaries={setGenerateTimetable} stationNames={stationNames} loadTrains={loadTrains}/>
      </main>
    )
  }
}
