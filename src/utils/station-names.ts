import {StationNames} from "@/types/types";

export function getStationCode(stationNames: StationNames, stationName: string) {
  return stationNames.find(station => station.name === stationName || "pinyinCode" in station && station.pinyinCode === stationName || "pinyin" in station && station.pinyin === stationName || "pinyinInitials" in station && station.pinyinInitials === stationName)?.code
    || stationNames.find(station => station.name.toLowerCase() === stationName.toLowerCase() || "pinyinCode" in station && station.pinyinCode.toLowerCase() === stationName.toLowerCase() || "pinyin" in station && station.pinyin.toLowerCase() === stationName.toLowerCase() || "pinyinInitials" in station && station.pinyinInitials.toLowerCase() === stationName.toLowerCase())?.code
    || stationNames.find(station => stationName != "" && station.name.includes(stationName))?.code
    || stationNames.find(station => stationName != "" && station.name.toLowerCase().includes(stationName.toLowerCase()))?.code;
}

export function getStationName(stationNames: StationNames, stationCode?: string) {
  return stationNames.find(station => station.code === stationCode)?.name;
}
