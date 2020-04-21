import XLSX from 'xlsx';

import Database from './database';
import {timeToMonthDayWeek} from './util';

const excelHeader = () => {
  return [
    '③사용 \n일자 \n(요일)',
    '부서',
    '성명',
    '⑤주행 전 \n계기판의 거리(㎞)',
    '⑥주행 후 \n계기판의 거리(㎞)',
    '⑦주행거리(㎞)',
    '⑧출ㆍ퇴근용(㎞)',
    '⑨일반 업무용(㎞)',
    '⑩비 고',
  ];
};

const excelDataRow = (date, distance, type) => {
  const commute = type === Database.Trip.Type.COMMUTE ? distance : '';
  const business = type === Database.Trip.Type.BUSINESS ? distance : '';
  return [date, '', '', '', '', distance, commute, business, ''];
};

const excelData = (realm, year) => {
  const list = Database.getTripListByYear(realm, year);
  const data = [];
  data.push(excelHeader());
  list.forEach(trip => {
    // console.log('trip', trip);
    const date = timeToMonthDayWeek(trip.startCreated);
    const distance = (trip.totalDistance / 1000).toFixed(2);
    const row = excelDataRow(date, parseFloat(distance), trip.type);
    data.push(row);
  });
  return data;
};

const makeExcel = data => {
  var ws_name = 'Sheet';
  var ws = XLSX.utils.aoa_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  return XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
};

export const bundleTripExcel = (realm, year) => {
  const subject = `업무용 승용차 운행기록부 ${String(year)}년`;
  const body = '첨부파일 참조바랍니다.';
  const filename = `car-log-trip-${String(year)}.xlsx`;
  const type = 'xlsx';
  const data = makeExcel(excelData(realm, year));
  return {subject, body, filename, type, data};
};

const jsonData = (realm, year) => {
  const list = Database.getLocationListByYear(realm, year).sorted(
    'created',
    false,
  );
  return JSON.stringify(list);
};

export const bundleLocationJson = (realm, year) => {
  const subject = `업무용 승용차 운행 위치정보 ${String(year)}년`;
  const body = '첨부파일 참조바랍니다.';
  const filename = `car-log-location-${String(year)}.json`;
  const type = 'json';
  const data = jsonData(realm, year);
  return {subject, body, filename, type, data};
};
