import {isEnabled, isLoaded} from "@/utils/train";
import toposort from "toposort";
import {getStationName} from "@/utils/station-names";
import {DatedRoute, StationNames, Trains, TrainStops} from "@/types";

/**
 * Combines the stops from all trains into a single list of stations using a topological sort.
 */
export function sortStations(stationNames: StationNames, timetableRoute: DatedRoute, trains: Trains) {
  if (!trains || !trains.length) {
    return [];
  }
  // Create a graph of stations
  const stationsGraph: [string, string][] = [];
  // Loop through all trains with stops loaded and add the stations to the graph
  for (const train of trains.filter(isLoaded).filter(isEnabled)) {
    let trainStops;
    if (train.trainSummary.from_station_telecode === timetableRoute.fromStationCode && train.trainSummary.to_station_telecode === timetableRoute.toStationCode) {
      // Train stops are already in the correct order
      trainStops = trimStops(stationNames, train.trainStops, timetableRoute);
    } else if (train.trainSummary.from_station_telecode === timetableRoute.toStationCode && train.trainSummary.to_station_telecode === timetableRoute.fromStationCode) {
      // Train stops are in the reverse order
      trainStops = trimStops(stationNames, train.trainStops.toReversed(), timetableRoute);
    }
    if (!trainStops) {
      continue;
    }
    // Add the list of edges between stations to the graph
    stationsGraph.push(...getEdges(trainStops));
  }
  // Topo sort the stations based on the graph
  const allSortedStations = toposort(stationsGraph);
  // Only keep stations between the "from" and "to" stations
  return allSortedStations.slice(allSortedStations.indexOf(getStationName(stationNames, timetableRoute.fromStationCode)!), allSortedStations.lastIndexOf(getStationName(stationNames, timetableRoute.toStationCode)!) + 1);
}

function trimStops(stationNames: StationNames, trainStops: TrainStops, timetableRoute: DatedRoute) {
  return trainStops.slice(trainStops.findIndex(trainStop => trainStop.station_name === getStationName(stationNames, timetableRoute.fromStationCode)), trainStops.findLastIndex(trainStop => trainStop.station_name === getStationName(stationNames, timetableRoute.toStationCode)) + 1);
}

/**
 * Transforms the list of train stops into a list of edges between stations.
 */
function getEdges(trainStops: TrainStops) {
  return trainStops.filter((_trainStop, index) => index < trainStops.length - 1).map((trainStop, index) => [trainStop.station_name, trainStops[index + 1].station_name] as [string, string]);
}
