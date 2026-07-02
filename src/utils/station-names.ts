import {CrStationNames} from "@/types/cr-types";
import {StationNames} from "@/types/types";

export function getStationCode(stationNames: CrStationNames, stationName: string) {
  return stationNames.find(station => station.name === stationName || station.pinyinCode === stationName || station.pinyin === stationName || station.pinyinInitials === stationName)?.code;
}

export function getStationName(stationNames: StationNames, stationCode?: string) {
  return stationNames.find(station => station.code === stationCode)?.name;
}
