import {ChangeEventHandler} from "react";
import {StationNames, Train} from "@/types/types";
import {getStationName} from "@/utils/station-names";
import {TailwindColorDivide} from "@/types/color";

type TrainSummaryCardProps = {
  stationNames: StationNames,
  train: Train,
  showDetail?: boolean,
  enabledOption?: boolean,
  enabledOptionCallback?: ChangeEventHandler<HTMLInputElement>,
  colorDivide: TailwindColorDivide,
};

export function TrainSummaryCard({stationNames, train, showDetail = true, enabledOption = true, enabledOptionCallback = () => {}, colorDivide}: TrainSummaryCardProps) {
  const {trainStops} = train;

  return (
    <div className={`divide-y text-center ${colorDivide}`}>
      <div className="py-2 flex items-center">
        <div className="grow basis-0"></div>
        <div className="text-lg">{train.trainCode}</div>
        <div className="grow basis-0">
          {enabledOption && <input type="checkbox" checked={train.enabled} onChange={enabledOptionCallback}/>}
        </div>
      </div>
      <div className="py-2 flex justify-evenly items-center">
        <div>
          <div>{train.boardTime}</div>
          <div>{getStationName(stationNames, train.boardStationCode)} ({train.boardStationCode})</div>
          <div>始：{getStationName(stationNames, train.originStationCode)} ({train.originStationCode})</div>
        </div>
        <div>→</div>
        <div>
          <div>{train.alightTime}</div>
          <div>{getStationName(stationNames, train.alightStationCode)} ({train.alightStationCode})</div>
          <div>终：{getStationName(stationNames, train.terminalStationCode)} ({train.terminalStationCode})</div>
        </div>
      </div>
      {showDetail && <div className="py-2">
        {trainStops.map((trainStop, index) =>
          <div key={index} className="flex justify-between items-center">
            <div>{trainStop.stationNo ? trainStop.stationNo : index + 1}. {trainStop.stationName}</div>
            {trainStop.arriveTime && trainStop.leaveTime && <div>{trainStop.arriveTime} - {trainStop.leaveTime}</div>}
            {trainStop.stopoverTime && <div>{trainStop.stopoverTime.endsWith("分钟") ? trainStop.stopoverTime.substring(0, trainStop.stopoverTime.length - 1) : trainStop.stopoverTime}</div>}
          </div>
        )}
      </div>}
    </div>
  )
}
