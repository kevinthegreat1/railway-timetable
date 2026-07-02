import {TrainSummaryCard} from "@/components/train-summary-card";
import {CrStationNames} from "@/types/cr-types";
import {Trains} from "@/types/types";
import {isLoaded} from "@/utils/train";
import {ChangeEventHandler} from "react";

type TrainSummariesProps = {
  stationNames: CrStationNames,
  trains: Trains,
  getTrainEnabledCallback: (train_no: string) => ChangeEventHandler<HTMLInputElement>,
  generateTimetable: () => void
};

export function TrainSummaries({stationNames, trains, getTrainEnabledCallback, generateTimetable}: TrainSummariesProps) {
  const loadedTrains = trains.filter(isLoaded);
  const trainsText = loadedTrains.length !== trains.length ? `加载中 ${loadedTrains.length}/${trains.length}列` : `${trains.length}列`

  return (
    <div className="h-dvh flex flex-col items-center p-4 gap-4">
      <div className="text-xl">列车（{trainsText}）</div>
      <div className="grow overflow-auto scrollbar-hide grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {trains.map((train, index) =>
          <div key={index} className="px-2 rounded-xl bg-sky-100">
            <TrainSummaryCard stationNames={stationNames} train={train} enabledOptionCallback={getTrainEnabledCallback(train.trainId)}/>
          </div>
        )}
      </div>
      <button onClick={generateTimetable} className="px-6 py-2 rounded-full text-lg bg-sky-200">生成时刻表</button>
    </div>
  )
}
