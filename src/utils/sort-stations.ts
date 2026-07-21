import toposort from "toposort";
import {DatedRoute, Route, Routes, StationNames, Trains, TrainStops} from "@/types/types";
import {areStationsEqual, getStationName} from "@/utils/station-names";
import {isEnabled, isLoaded} from "@/utils/train";

/**
 * Combines the stops from all trains into a single list of stations using a topological sort.
 */
export function sortStations(stationNames: StationNames, timetableRoute: DatedRoute, routesToSearch: Routes, trains?: Trains) {
  if (!trains || !trains.length) {
    return [];
  }
  // Create a graph of stations
  const stationsGraph: [string, string][] = [];
  // Loop through all trains with stops loaded and add the stations to the graph
  for (const train of trains.filter(isLoaded).filter(isEnabled)) {
    let trainStops;
    // Check the full length timetable route first
    if (areStationsEqual(stationNames, train.boardStationCode, timetableRoute.fromStationCode) && areStationsEqual(stationNames, train.alightStationCode, timetableRoute.toStationCode)) {
      // Train stops are already in the correct order
      trainStops = trimStops(stationNames, train.trainStops, timetableRoute);
    } else if (areStationsEqual(stationNames, train.boardStationCode, timetableRoute.toStationCode) && areStationsEqual(stationNames, train.alightStationCode, timetableRoute.fromStationCode)) {
      // Train stops are in the reverse order
      trainStops = trimStops(stationNames, train.trainStops.toReversed(), timetableRoute);
    } else for (const route of routesToSearch) {
      // Check if train matches additional routes to search
      if (areStationsEqual(stationNames, train.boardStationCode, route.fromStationCode) && areStationsEqual(stationNames, train.alightStationCode, route.toStationCode)) {
        trainStops = trimStops(stationNames, train.trainStops, route);
        break;
      } else if (areStationsEqual(stationNames, train.boardStationCode, route.toStationCode) && areStationsEqual(stationNames, train.alightStationCode, route.fromStationCode)) {
        trainStops = trimStops(stationNames, train.trainStops.toReversed(), route);
        break;
      }
    }

    // No segment of this train is usable to calculate the station order
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

function trimStops(stationNames: StationNames, trainStops: TrainStops, route: Route) {
  return trainStops.slice(trainStops.findIndex(trainStop => trainStop.stationName === getStationName(stationNames, route.fromStationCode)), trainStops.findLastIndex(trainStop => trainStop.stationName === getStationName(stationNames, route.toStationCode)) + 1);
}

/**
 * Transforms the list of train stops into a list of edges between stations.
 */
function getEdges(trainStops: TrainStops) {
  return trainStops.filter((_trainStop, index) => index < trainStops.length - 1).map((trainStop, index) => [trainStop.stationName, trainStops[index + 1].stationName] as [string, string]);
}
