"use client";

import {useState} from "react";
import TimetablePage, {LoadTrains} from "@/components/timetable-page";

export default function AmtrakTimetablePage() {
  async function fetchStationNames() {
    const stationNamesResponse = await fetch("https://www.amtrak.com/services/data.stations.json");
    return await stationNamesResponse.json();
  }

  const [loadTrainSummaries, setLoadTrainSummaries] = useState<boolean>(false);
  const [generateTimetable, setGenerateTimetable] = useState<boolean>(false);

  const loadTrains: LoadTrains = (_, setTrains) => (timetableRoute, routesToSearch) => {}

  return <TimetablePage fetchStationNames={fetchStationNames} loadTrains={loadTrains}
                        loadTrainSummaries={loadTrainSummaries} setLoadTrainSummaries={setLoadTrainSummaries}
                        generateTimetable={generateTimetable} setGenerateTimetable={setGenerateTimetable}
                        colorBg="bg-teal-50" colorMg="bg-teal-100" colorFg="bg-teal-200" colorDivide="divide-teal-200"/>
}
