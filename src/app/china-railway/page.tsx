"use client";

import {useState} from "react";
import TimetablePage, {LoadTrains} from "@/components/timetable-page";
import {getTrainsForAllRoutes} from "@/utils/cr-utils";
import {sleep} from "@/utils/time";

export default function CrTimetablePage() {
  async function fetchStationNames() {
    const stationNamesResponse = await fetch("/china-railway/station-names");
    return await stationNamesResponse.json();
  }

  const [loadTrainSummaries, setLoadTrainSummaries] = useState<boolean>(false);
  const [generateTimetable, setGenerateTimetable] = useState<boolean>(false);

  const loadTrains: LoadTrains = (stationNames, timetableRoute, routesToSearch, setTrains) => {
    fetch(`/china-railway/init`)
      .then(async () => await sleep(500))
      .then(() => void getTrainsForAllRoutes(stationNames, timetableRoute, routesToSearch, setTrains))
  }

  return <TimetablePage fetchStationNames={fetchStationNames} loadTrains={loadTrains}
                        loadTrainSummaries={loadTrainSummaries} setLoadTrainSummaries={setLoadTrainSummaries}
                        generateTimetable={generateTimetable} setGenerateTimetable={setGenerateTimetable}
                        colorBg="bg-sky-50" colorMg="bg-sky-100" colorFg="bg-sky-200" colorDivide="divide-sky-200"/>
}
