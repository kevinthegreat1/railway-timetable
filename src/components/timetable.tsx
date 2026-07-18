import {CategoryScale, Chart, ChartData, ChartOptions, LineElement, PointElement, TimeScale} from "chart.js";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm"
import {ChangeEventHandler, useState} from "react";
import {Line} from "react-chartjs-2";
import {TrainSummaryCard} from "@/components/train-summary-card";
import {Station, StationNames, Trains} from "@/types/types";
import {isEnabled, isLoaded} from "@/utils/train";
import {TailwindColorBg, TailwindColorDivide} from "@/types/color";

type TimetableProps = {
  stationNames: StationNames,
  date: string,
  trains: Trains,
  getTrainEnabledCallback: (trainId: string) => ChangeEventHandler<HTMLInputElement>,
  sortedStations: string[],
  colorBg: TailwindColorBg,
  colorDivide: TailwindColorDivide,
};
type TrainStopData = { stationName: string, time: string };

export function Timetable({stationNames, date, trains, getTrainEnabledCallback, sortedStations, colorBg, colorDivide }: TimetableProps) {
  Chart.register(CategoryScale, LineElement, PointElement, TimeScale);

  const [stations, setStations] = useState<Station[]>(sortedStations.map(stationName => ({stationName, enabled: true})));
  const enabledTrains = trains.filter(isEnabled);
  const loadedTrains = trains.filter(isLoaded);
  const trainsText = `显示 ${enabledTrains.length}/${trains.length}列`;
  const trainsLoadingText = `加载中 ${loadedTrains.length}/${trains.length}列`

  const data: ChartData<"line", TrainStopData[]> = {
    datasets: enabledTrains.map(train => {
      return {
        label: train.trainCode,
        data: train.trainStops.filter(stop => stations.find(({stationName}) => stationName == stop.stationName)?.enabled).flatMap(stop => {
          const times: TrainStopData[] = [];
          if (!stop) {
            return times;
          }
          if (stop.arriveTime && stop.arriveTime.match("\\d+:\\d+")) {
            times.push({stationName: stop.stationName, time: stop.arriveTime});
          }
          if (stop.leaveTime && stop.leaveTime.match("\\d+:\\d+")) {
            times.push({stationName: stop.stationName, time: stop.leaveTime});
          }
          return times;
        }),
        borderColor: "rgb(64,64,64)",
        borderWidth: 1,
        pointRadius: 0,
      }
    })
  }
  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        type: "time",
        time: {
          parser: "HH:mm",
          unit: "minute",
          displayFormats: {
            minute: "HH:mm"
          }
        }
      },
      y: {
        type: "category",
        labels: stations.filter(({enabled}) => enabled).map(({stationName}) => stationName)
          .filter((stationName) =>
            enabledTrains.some(train => train.trainStops.some(stop => stop.stationName == stationName))
          )
      }
    },
    parsing: {
      xAxisKey: "time",
      yAxisKey: "stationName"
    }
  };

  function getStationEnabledCallback(index: number): ChangeEventHandler<HTMLInputElement> {
    return e => {
      const newStations = [...stations];
      newStations[index].enabled = e.target.checked;
      setStations(newStations);
    }
  }

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <div className="text-xl">运行图 {date}</div>
      <div className="text-lg">列车（{trainsText}）</div>
      {loadedTrains.length !== trains.length && <div className="text-lg">{trainsLoadingText}</div>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {trains.map((train, index) =>
          <div key={index} className={`px-2 rounded-xl ${colorBg}`}>
            <TrainSummaryCard stationNames={stationNames} train={train} showDetail={false} enabledOptionCallback={getTrainEnabledCallback(train.trainId)} colorDivide={colorDivide}/>
          </div>
        )}
      </div>
      <div className="text-lg">站点</div>
      <div className="flex flex-wrap gap-4">
        {stations.map(({stationName, enabled}, index) =>
          <div key={stationName} className={`p-2 rounded-xl ${colorBg} flex flex-row gap-2`}>
            <div>{stationName}</div>
            <input id="enabled" type="checkbox" checked={enabled} onChange={getStationEnabledCallback(index)}/>
          </div>
        )}
      </div>
      <div className="text-lg">运行图</div>
      <Line data={data} options={options}></Line>
    </div>
  )
}
