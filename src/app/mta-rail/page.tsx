"use client";

import {useState} from "react";
import TimetablePage, {LoadTrains} from "@/components/timetable-page";
import {loadMtaTrains} from "@/utils/mta-utils";
import {fromMtaTrain} from "@/utils/train";

export default function MtaTimetablePage() {
  async function fetchStationNames() {
    const stationNamesResponse = await fetch("https://backend-unified.mylirr.org/infrastructure?language=en", {headers: {"Accept-Version": "3.0"}});
    return (await stationNamesResponse.json()).stations;
  }

  const [generateTimetable, setGenerateTimetable] = useState<boolean>(false);

  const loadTrains: LoadTrains = (stationNames, setTrains) => (timetableRoute, routesToSearch) => {
    void loadMtaTrains(timetableRoute, routesToSearch, mtaTrains => setTrains(mtaTrains.map(t => fromMtaTrain(stationNames, t))));
  }

  return <TimetablePage fetchStationNames={fetchStationNames} loadTrains={loadTrains}
                        loadTrainSummaries={generateTimetable} setLoadTrainSummaries={setGenerateTimetable}
                        generateTimetable={generateTimetable} setGenerateTimetable={setGenerateTimetable}
                        colorBg="bg-red-50" colorMg="bg-red-100" colorFg="bg-red-200" colorDivide="divide-red-300"/>
}
