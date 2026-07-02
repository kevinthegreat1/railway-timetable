import {CrStationName} from "@/types/cr-types";

export async function GET() {
  const stationNamesResponse = await fetch("https://kyfw.12306.cn/otn/resources/js/framework/station_name.js");
  const stationNamesString = await stationNamesResponse.text();
  const stationNamesStringArray = stationNamesString.slice(stationNamesString.indexOf('@') + 1, stationNamesString.lastIndexOf("'")).split('@');
  const stationNames = stationNamesStringArray.map((stationName): CrStationName => {
    const [pinyinCode, name, code, pinyin, pinyinInitials, stationCode, cityCode, city, countryCode, country, cityEn] = stationName.split('|');
    return {pinyinCode, name, code, pinyin, pinyinInitials, stationCode, cityCode, city, countryCode, country, cityEn}
  });
  return Response.json(stationNames);
}
