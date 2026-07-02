"use client";

import {ChangeEventHandler, useEffect, useState} from "react";
import {RoutesForm} from "@/components/routes-form";
import {Timetable} from "@/components/timetable";
import {TrainSummaries} from "@/components/train-summaries";
import {Loading} from "@/components/loading";
import {CrStationNames, CrTrains} from "@/types/cr-types";
import {DatedRoute} from "@/types/types";
import {fromCrTrain, isLoaded} from "@/utils/train";
import {sortStations} from "@/utils/sort-stations";

export default function TimetablePage() {
  const [stationNames, setStationNames] = useState<CrStationNames>([]);
  useEffect(() => {
    async function fetchStationNames() {
      const stationNamesResponse = await fetch("/china-railway/station-names");
      setStationNames(await stationNamesResponse.json());
    }

    // noinspection JSIgnoredPromiseFromCall
    fetchStationNames();
  }, []);

  const [timetableRoute, setTimetableRoute] = useState<DatedRoute>({bothWays: true, date: new Date().toISOString().split('T')[0]} as DatedRoute);

  const [trains, setTrains] = useState<CrTrains>([]);
  const [loadTrainSummaries, setLoadTrainSummaries] = useState<boolean>(false);
  const [generateTimetable, setGenerateTimetable] = useState<boolean>(false);

  const sortedStations = sortStations(stationNames, timetableRoute, trains.map(fromCrTrain));

  function getTrainEnabledCallback(train_no: string): ChangeEventHandler<HTMLInputElement> {
    return e => {
      const newTrains = [...trains];
      newTrains.find(t => t.trainSummary.train_no === train_no)!.enabled = e.target.checked;
      setTrains(newTrains);
    }
  }

  if (generateTimetable) {
    if (trains && trains.every(isLoaded) && sortedStations) {
      return (
        <main className="min-h-screen bg-sky-50">
          <Timetable stationNames={stationNames} date={timetableRoute.date} trains={trains} getTrainEnabledCallback={getTrainEnabledCallback} sortedStations={sortedStations} key={sortedStations.join(',')}/> {/* Pass a key to ensure the station enabled states are reset in timetable for every different list of sorted stations. */}
        </main>
      )
    } else {
      return <Loading loadingText={`${trains.filter(isLoaded).length}/${trains.length}列`}/>
    }
  } else if (loadTrainSummaries) {
    if (trains && trains.length) {
      return (
        <main className="min-h-screen bg-sky-50">
          <TrainSummaries stationNames={stationNames} trains={trains} getTrainEnabledCallback={getTrainEnabledCallback} generateTimetable={() => setGenerateTimetable(true)}/>
        </main>
      )
    } else {
      return <Loading/>
    }
  } else {
    return (
      <main className="min-h-screen bg-sky-50">
        <RoutesForm timetableRoute={timetableRoute} setTimetableRoute={setTimetableRoute} setLoadTrainSummaries={setLoadTrainSummaries} stationNames={stationNames} setTrains={setTrains}/>
      </main>
    )
  }
}
