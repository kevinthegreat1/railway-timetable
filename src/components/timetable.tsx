import {CategoryScale, Chart, ChartData, ChartOptions, LinearScale, LineElement, Point, PointElement, TimeScale} from "chart.js";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm"
import {ChangeEventHandler, useState} from "react";
import {Line, Scatter} from "react-chartjs-2";
import {TrainSummariesCard} from "@/components/train-summaries";
import {TailwindColorBg, TailwindColorDivide} from "@/types/color";
import {MinuteTimestamp, Station, StationNames, Trains} from "@/types/types";
import {millisToHourMinute} from "@/utils/time";
import {clusterTrains, isDown, isEnabled, isLoaded, isUp} from "@/utils/train";

type TimetableProps = {
  stationNames: StationNames,
  date: string,
  trains: Trains,
  getTrainEnabledCallback: (trainId: string) => ChangeEventHandler<HTMLInputElement>,
  sortedStations: string[],
  colorBg: TailwindColorBg,
  colorDivide: TailwindColorDivide,
};
type TrainStopData = { stationName: string, time: MinuteTimestamp };

export function Timetable({stationNames, date, trains, getTrainEnabledCallback, sortedStations, colorBg, colorDivide }: TimetableProps) {
  Chart.register(CategoryScale, LinearScale, LineElement, PointElement, TimeScale);

  const [stations, setStations] = useState<Station[]>(sortedStations.map(stationName => ({stationName, enabled: true})));
  const [up, setUp] = useState<boolean>(true);
  const [down, setDown] = useState<boolean>(true);
  const [cluster, setCluster] = useState<boolean>(true);
  const [clusterChart, setClusterChart] = useState<boolean>(false);

  const enabledStations = stations.filter(({enabled}) => enabled).map(({stationName}) => stationName);
  const enabledTrains = trains.filter(isEnabled).filter(train => up && isUp(enabledStations, train) || down && isDown(enabledStations, train));
  const trainsClusterData = clusterTrains(enabledStations, enabledTrains);
  const loadedTrains = trains.filter(isLoaded);
  const trainsText = `显示 ${enabledTrains.length}/${trains.length}列`;
  const trainsLoadingText = `加载中 ${loadedTrains.length}/${trains.length}列`

  const data: ChartData<"line", TrainStopData[]> = {
    datasets: enabledTrains.map(train => ({
      label: train.trainCode,
      data: train.trainStops.filter(({stationName}) => enabledStations.includes(stationName)).flatMap(stop => {
        const times: TrainStopData[] = [];
        if (!stop) {
          return times;
        }
        if (stop.arriveTime && stop.arriveTime.match(/\d+-\d+-\d+ \d+:\d+/)) {
          times.push({stationName: stop.stationName, time: stop.arriveTime});
        }
        if (stop.leaveTime && stop.leaveTime.match(/\d+-\d+-\d+ \d+:\d+/)) {
          times.push({stationName: stop.stationName, time: stop.leaveTime});
        }
        return times;
      }),
      borderColor: cluster ? train.clusterColor ?? "rgb(64,64,64)" : "rgb(64,64,64)",
      borderWidth: 1,
      pointRadius: 0,
    }))
  }
  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        type: "time",
        time: {
          parser: "YYYY-MM-DD HH:mm",
          unit: "minute",
          displayFormats: {
            minute: "HH:mm"
          }
        },
        ticks: {
          callback: (value) => [0, 15, 30, 45].includes(new Date(value).getMinutes()) ? typeof value === "string" ? value : millisToHourMinute(value) : null
        }
      },
      y: {
        type: "category",
        labels: enabledStations.filter((stationName) =>
          enabledTrains.some(train => train.trainStops.some(stop => stop.stationName == stationName))
        ),
        ticks: {
          autoSkip: false
        }
      }
    },
    parsing: {
      xAxisKey: "time",
      yAxisKey: "stationName"
    }
  };

  const clusterChartData: ChartData<"scatter", Point[]> | undefined = trainsClusterData ? {
    datasets: [{
      data: trainsClusterData.map(({clusterData}) => ({
        x: clusterData[0],
        y: clusterData[1]
      })),
      pointBackgroundColor: trainsClusterData.map(({train}) => train.clusterColor),
      pointBorderWidth: 0
    }],
  } : undefined;
  const clusterChartOptions: ChartOptions<"scatter"> = {
    scales: {
      x: {
        title: {
          display: true,
          text: "停站数/总站数",
        },
      },
      y: {
        title: {
          display: true,
          text: "平均区间用时（分钟）",
        },
      },
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
      <TrainSummariesCard stationNames={stationNames} trains={trains} getTrainEnabledCallback={getTrainEnabledCallback} showDetail={false} overflowAuto={false} colorBg={colorBg} colorDivide={colorDivide}/>
      <div className="text-lg">站点</div>
      <div className="flex flex-wrap gap-4">
        {stations.map(({stationName, enabled}, index) =>
          <div key={stationName} className={`p-2 rounded-xl ${colorBg} flex flex-row gap-2`}>
            <div>{stationName}</div>
            <input id="enabled" type="checkbox" checked={enabled} onChange={getStationEnabledCallback(index)}/>
          </div>
        )}
      </div>
      <div className={`flex divide-x ${colorDivide}`}>
        <div className="px-4 flex flex-col items-center gap-4">
          <div className="text-lg">方向</div>
          <div className="flex flex-wrap gap-4">
            <div className={`p-2 rounded-xl ${colorBg} flex flex-row gap-2`}>
              <div>上行</div>
              <input id="enabled" type="checkbox" checked={up} onChange={e => setUp(e.target.checked)}/>
            </div>
            <div className={`p-2 rounded-xl ${colorBg} flex flex-row gap-2`}>
              <div>下行</div>
              <input id="enabled" type="checkbox" checked={down} onChange={e => setDown(e.target.checked)}/>
            </div>
          </div>
        </div>
        <div className="px-4 flex flex-col items-center gap-4">
          <div className="text-lg">分类</div>
          <div className="flex flex-wrap gap-4">
            <div className={`p-2 rounded-xl ${colorBg} flex flex-row gap-2`}>
              <div>自动分类</div>
              <input id="enabled" type="checkbox" checked={cluster} onChange={e => setCluster(e.target.checked)}/>
            </div>
            <div className={`p-2 rounded-xl ${colorBg} flex flex-row gap-2`}>
              <div>分类图</div>
              <input id="enabled" type="checkbox" checked={clusterChart} onChange={e => setClusterChart(e.target.checked)}/>
            </div>
          </div>
        </div>
      </div>
      <div className="text-lg">运行图</div>
      <Line data={data} options={options}/>
      {clusterChart && <>
          <div className="text-lg">分类图</div>
        {clusterChartData && <Scatter data={clusterChartData} options={clusterChartOptions}/>}
      </>}
    </div>
  )
}
