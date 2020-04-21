import XLSX from 'xlsx';

import Database from './database';
import {TimeUtil} from './util';

const excelHeader = () => {
  return [
    '③사용 일자 \n(요일)',
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

const excelDataRow = trip => {
  const date = TimeUtil.timeToMonthDayWeek(trip.startCreated);
  const distance = parseFloat((trip.totalDistance / 1000).toFixed(2));
  const commute = trip.type === Database.Trip.Type.COMMUTE ? distance : '';
  const business = trip.type === Database.Trip.Type.BUSINESS ? distance : '';
  return [date, '', '', '', '', distance, commute, business, ''];
};

const excelDetailHeader = () => {
  return [
    '사용 일자 \n(요일)',
    '출발시각',
    '도착시각',
    '소요시간',
    '용도',
    '주행거리(㎞)',
    '출발지 위도',
    '출발지 경도',
    '출발지 주소',
    '도착지 위도',
    '도착지 경도',
    '도착지 주소',
  ];
};

const excelDetailDataRow = trip => {
  const date = TimeUtil.timeToMonthDayWeek(trip.startCreated);
  const startDate = TimeUtil.timeToDateHourMin(trip.startCreated);
  const endDate = TimeUtil.timeToDateHourMin(trip.endCreated);
  const duration = TimeUtil.msToTime(trip.endCreated - trip.startCreated);
  const purpose = '';
  const distance = parseFloat((trip.totalDistance / 1000).toFixed(2));
  return [
    date,
    startDate,
    endDate,
    duration,
    purpose,
    distance,
    trip.startLatitude,
    trip.startLongitude,
    trip.startAddress,
    trip.endLatitude,
    trip.endLongitude,
    trip.endAddress,
  ];
};

const excelData = (realm, year, detail = false) => {
  const list = Database.getTripListByYear(realm, year);
  const data = [];
  data.push(detail ? excelDetailHeader() : excelHeader());
  list.forEach(trip => {
    // console.log('trip', trip);
    const row = detail ? excelDetailDataRow(trip) : excelDataRow(trip);
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

export const bundleTripDetailExcel = (realm, year) => {
  const subject = `업무용 승용차 운행 상세기록 ${String(year)}년`;
  const body = '첨부파일 참조바랍니다.';
  const filename = `car-log-trip-detail-${String(year)}.xlsx`;
  const type = 'xlsx';
  const data = makeExcel(excelData(realm, year, true));
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
