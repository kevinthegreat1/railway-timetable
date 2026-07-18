import {ChangeEventHandler, useEffect, useState} from "react";
import {Loading} from "@/components/loading";
import {RoutesForm} from "@/components/routes-form";
import {Timetable} from "@/components/timetable";
import {TrainSummaries} from "@/components/train-summaries";
import {DatedRoute, Routes, StationNames, Trains} from "@/types/types";
import {sortStations} from "@/utils/sort-stations";
import {isLoaded} from "@/utils/train";
import {TailwindColorBg, TailwindColorDivide} from "@/types/color";

export type LoadTrains = (stationNames: StationNames, setTrains: (trains: Trains) => void) => (timetableRoute: DatedRoute, routesToSearch: Routes) => void;

type TimetablePageProps = {
  fetchStationNames(): Promise<StationNames>,
  loadTrains: LoadTrains,
  loadTrainSummaries: boolean,
  setLoadTrainSummaries(loadTrainSummaries: boolean): void,
  generateTimetable: boolean,
  setGenerateTimetable(generateTimetable: boolean): void,
  colorBg: TailwindColorBg,
  colorMg: TailwindColorBg,
  colorFg: TailwindColorBg,
  colorDivide: TailwindColorDivide,
};

export default function TimetablePage({fetchStationNames, loadTrains, loadTrainSummaries, setLoadTrainSummaries, generateTimetable, setGenerateTimetable, colorBg, colorMg, colorFg, colorDivide}: TimetablePageProps) {
  const [stationNames, setStationNames] = useState<StationNames>([]);
  useEffect(() => void fetchStationNames().then(setStationNames), []);

  const [timetableRoute, setTimetableRoute] = useState<DatedRoute>({bothWays: true, date: new Date().toISOString().split('T')[0]} as DatedRoute);
  const [trains, setTrains] = useState<Trains | undefined>(undefined);

  const sortedStations = sortStations(stationNames, timetableRoute, trains);

  function getTrainEnabledCallback(trainId: string): ChangeEventHandler<HTMLInputElement> {
    return e => {
      if (!trains) return;
      const newTrains = [...trains];
      newTrains.find(t => t.trainId === trainId)!.enabled = e.target.checked;
      setTrains(newTrains);
    }
  }

  if (generateTimetable) {
    if (trains && sortedStations) {
      return (
        <main className={`min-h-screen ${colorBg}`}>
          <Timetable stationNames={stationNames} date={timetableRoute.date} trains={trains} getTrainEnabledCallback={getTrainEnabledCallback} sortedStations={sortedStations} key={sortedStations.join(',')} colorBg={colorMg} colorDivide={colorDivide}/>
        </main>
      )
    } else {
      return <Loading loadingText={trains && `${trains.filter(isLoaded).length}/${trains.length}列`} colorBg={colorBg} colorFg={colorMg}/>
    }
  } else if (loadTrainSummaries) {
    if (trains && trains.length) {
      return (
        <main className={`min-h-screen ${colorBg}`}>
          <TrainSummaries stationNames={stationNames} trains={trains} getTrainEnabledCallback={getTrainEnabledCallback} generateTimetable={() => setGenerateTimetable(true)} colorBg={colorMg} colorFg={colorFg} colorDivide={colorDivide}/>
        </main>
      )
    } else {
      return <Loading colorBg={colorBg} colorFg={colorMg}/>
    }
  } else {
    return (
      <main className={`min-h-screen ${colorBg}`}>
        <RoutesForm timetableRoute={timetableRoute} setTimetableRoute={setTimetableRoute} setLoadTrainSummaries={setLoadTrainSummaries} stationNames={stationNames} loadTrains={loadTrains(stationNames, setTrains)} colorBg={colorMg} colorFg={colorFg} colorDivide={colorDivide}/>
      </main>
    )
  }
}
