"use client";

import {ChangeEventHandler, useEffect, useState} from "react";
import {Loading} from "@/components/loading";
import {RoutesForm} from "@/components/routes-form";
import {Timetable} from "@/components/timetable";
import {MtaStationNames} from "@/types/mta-types";
import {DatedRoute, Routes, Trains} from "@/types/types";
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

  const [trains, setTrains] = useState<Trains>([]);
  const [generateTimetable, setGenerateTimetable] = useState<boolean>(false);

  const sortedStations = sortStations(stationNames, timetableRoute, trains);

  function loadTrains(timetableRoute: DatedRoute, routesToSearch: Routes) {
    loadMtaTrains(timetableRoute, routesToSearch, mtaTrains => setTrains(mtaTrains.map(t => fromMtaTrain(stationNames, t))));
  }

  function getTrainEnabledCallback(trainId: string): ChangeEventHandler<HTMLInputElement> {
    return e => {
      const newTrains = [...trains];
      newTrains.find(t => t.trainId === trainId)!.enabled = e.target.checked;
      setTrains(newTrains);
    }
  }

  if (generateTimetable) {
    if (trains && trains.every(isLoaded) && sortedStations) {
      return (
        <main className="min-h-screen bg-red-50">
          <Timetable stationNames={stationNames} date={timetableRoute.date} trains={trains} getTrainEnabledCallback={getTrainEnabledCallback} sortedStations={sortedStations} key={sortedStations.join(',')}/>
        </main>
      )
    } else {
      return <Loading loadingText={`${trains.filter(isLoaded).length}/${trains.length}列`}/>
    }
  } else {
    return (
      <main className="min-h-screen bg-red-50">
        <RoutesForm timetableRoute={timetableRoute} setTimetableRoute={setTimetableRoute} setLoadTrainSummaries={setGenerateTimetable} stationNames={stationNames} loadTrains={loadTrains}/>
      </main>
    )
  }
}
