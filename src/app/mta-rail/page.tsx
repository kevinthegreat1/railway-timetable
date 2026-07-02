"use client";

import {useEffect, useState} from "react";
import {MtaStationNames, MtaTimetableTrains} from "@/types/mta-types";
import {DatedRoute} from "@/types/types";
import {sortStations} from "@/utils/sort-stations";
import {fromMtaTrain, isLoaded} from "@/utils/train";
import {Loading} from "@/components/loading";

export default function TimetablePage() {
  const [stationNames, setStationNames] = useState<MtaStationNames>([]);
  useEffect(() => {
    async function fetchStationNames() {
      const stationNamesResponse = await fetch("https://backend-unified.mylirr.org/infrastructure?language=en", {
        headers: {
          "Accept-Version": "3.0",
        }
      });
      setStationNames((await stationNamesResponse.json()).stations);
    }

    // noinspection JSIgnoredPromiseFromCall
    fetchStationNames();
  }, []);

  const [timetableRoute, setTimetableRoute] = useState<DatedRoute>({bothWays: true, date: new Date().toISOString().split('T')[0]} as DatedRoute);

  const [trains, setTrains] = useState<MtaTimetableTrains>([]);
  const [generateTimetable, setGenerateTimetable] = useState<boolean>(false);

  const sortedStations = sortStations(stationNames, timetableRoute, trains.map(t => fromMtaTrain(stationNames, t)));

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
      <div/>
    )
  }
}
