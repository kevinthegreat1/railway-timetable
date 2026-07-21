import {StationNames} from "@/types/types";

export function getStationCode(stationNames: StationNames, stationName: string): string | undefined {
  const filteredStations = stationNames.filter(s => !("exclude" in s) || !s.exclude);
  return filteredStations.find(station => station.code.toLowerCase() === stationName.toLowerCase())?.code
    || filteredStations.find(station => station.name === stationName || "pinyinCode" in station && station.pinyinCode === stationName || "pinyin" in station && station.pinyin === stationName || "pinyinInitials" in station && station.pinyinInitials === stationName)?.code
    || filteredStations.find(station => station.name.toLowerCase() === stationName.toLowerCase() || "pinyinCode" in station && station.pinyinCode.toLowerCase() === stationName.toLowerCase() || "pinyin" in station && station.pinyin.toLowerCase() === stationName.toLowerCase() || "pinyinInitials" in station && station.pinyinInitials.toLowerCase() === stationName.toLowerCase())?.code
    || filteredStations.find(station => stationName != "" && station.name.includes(stationName))?.code
    || filteredStations.find(station => stationName != "" && station.name.toLowerCase().includes(stationName.toLowerCase()))?.code;
}

export function getStationName(stationNames: StationNames, stationCode?: string) {
  return stationNames.find(station => station.code === stationCode)?.name;
}

export function areStationsEqual(stationNames: StationNames, stationCode1?: string, stationCode2?: string) {
  return stationCode1 === stationCode2 || getStationName(stationNames, stationCode1) === getStationName(stationNames, stationCode2);
}
