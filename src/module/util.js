import moment from 'moment';
import 'moment/locale/ko';

import {Queue} from './queue';
import {TripType} from '../module/type';

export function msToTime(s) {
  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
  // return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

export function timeToDate(timestamp) {
  return moment(timestamp).format('Y/MM/DD');
}

export function timeToWeek(timestamp) {
  return moment(timestamp).format('dddd');
}

export function timeToHourMin(timestamp) {
  return moment(timestamp).format('HH:mm');
}

export function timeToDateHourMin(timestamp) {
  return moment(timestamp).format('Y/MM/DD HH:mm');
}

export function timeToMonthDay(timestamp) {
  return moment(timestamp).format('MM/DD');
}

export function timeToMonthDayWeek(timestamp) {
  return moment(timestamp).format('MM/DD (ddd)'); // 04/07 (화)
}

export function yearToTimestamp(year) {
  const timestamp = moment(String(year), 'YYYY').format('x');
  return parseInt(timestamp, 10);
}

export function yearMonthToTimestamp(year, month) {
  const params = month > 12 ? {y: year + 1, m: 1} : {y: year, m: month};
  const m = moment(`${params.y}/${params.m}`, 'YYYY/MM');
  const timestamp = m.format('x');
  return parseInt(timestamp, 10);
}

export function timeToYearAndMonthValue(timestamp) {
  const t = moment(timestamp);
  return {year: t.year(), month: t.month() + 1};
}

export const TimeUtil = {
  msToTime,
  timeToWeek,
  timeToHourMin,
  timeToDateHourMin,
  timeToMonthDay,
  timeToMonthDayWeek,
  yearToTimestamp,
  yearMonthToTimestamp,
  timeToYearAndMonthValue,
};

// ref: https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
export function measure(lat1, lon1, lat2, lon2) {
  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  var dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000; // meters
}

export function distance(lat1, lon1, lat2, lon2) {
  const dx = lat2 - lat1;
  const dy = lon2 - lon1;
  return 100000 * Math.hypot(dx, dy);
}

export const searchStartPositions = (
  list,
  velocity,
  period,
  gpsErrorMargin = 1000,
) => {
  const fVelocity = parseFloat(velocity);
  const iPeriod = parseInt(period, 10);
  if (isNaN(fVelocity)) {
    console.warn('velocity is not number');
    return;
  }
  if (isNaN(iPeriod)) {
    console.warn('peroid is not number');
    return;
  }
  const periodInMil = iPeriod * 60 * 1000;
  let prev = {latitude: 0.0, longitude: 0.0, created: 0};
  const calculated = [];
  list.forEach((log, index) => {
    log.dt = log.created - prev.created;
    const dd = measure(
      prev.latitude,
      prev.longitude,
      log.latitude,
      log.longitude,
    );
    // console.log(index, dd.toFixed(0), prev.created);
    if (dd > gpsErrorMargin) {
      const vc = (1000 * dd) / log.dt;
      log.vc = vc.toFixed(3);
      log.dd = dd.toFixed(0);
      if (log.dt >= periodInMil) {
        console.log('Found start position', index);
        console.log('vc', log.vc, 'dd', log.dd);
        console.log('dt', msToTime(log.dt));
        console.log('log', log);
        console.log('log.created', timeToDateHourMin(log.created));
        console.log('prev', prev);
        console.log('prev.created', timeToDateHourMin(prev.created));
        if (prev.created !== 0) {
          calculated.push(log);
        }
      }
      prev = log;
    }
  });
  return calculated;
};

export const showStartPositions = list => {
  list.forEach((log, index) => {
    console.log(
      index,
      timeToDateHourMin(log.created),
      log.latitude,
      log.longitude,
    );
  });
};

export const calculateLocationList = list => {
  let prev = {latitude: 0.0, longitude: 0.0, created: 0};
  list.reverse().forEach((log, index) => {
    calculateLocation(log, prev);
    prev = log;
  });
  return list.reverse();
};

export const fixLastLocation = (list, prev) => {
  const lastIndex = list.length - 1;
  calculateLocation(list[lastIndex], prev);
  return list;
};

function calculateLocation(log, prev) {
  log.dt = log.created - prev.created;
  const dd = measure(
    prev.latitude,
    prev.longitude,
    log.latitude,
    log.longitude,
  );
  const vc = log.dt ? (1000 * dd) / log.dt : 0;
  log.vc = vc.toFixed(3);
  log.dd = dd.toFixed(0);
  return log;
}

export const detectSpeedZeroPoints = list => {
  const queueSize = 2;
  const prevQueue = new Queue(queueSize);
  const result = [];
  list.forEach((log, index) => {
    const last = prevQueue.peekLast();
    const size = prevQueue.getSize();
    if (size === queueSize && last && last.speed === 0) {
      const points = [...prevQueue.peekAll(), log];
      result.push(points);
    }
    prevQueue.enqueue(log);
  });
  return result;
};

export const toFixed = (number, digits = 2) => {
  return Number.parseFloat(number).toFixed(digits);
};

export const detectEdgePoints = (
  list,
  periodInMin,
  accuracyMargin = '40',
  radiusOfArea = '100',
) => {
  const fAccuracyMargin = parseFloat(accuracyMargin);
  const fRadiusOfArea = parseFloat(radiusOfArea);
  const iPeriodInMin = parseInt(periodInMin, 10);
  const iPeriodInMil = iPeriodInMin * 60 * 1000;
  let prev = {latitude: 0.0, longitude: 0.0, created: 0};
  let calculated = [];
  const lastIndex = list.length - 1;
  let isNotFirstArrival = false;
  let totalDistance = 0;
  let departTime = 0;
  for (let index = 0; index < list.length; index++) {
    const log = list[index];
    if (log.accuracy >= fAccuracyMargin) {
      continue;
    }
    const dt = log.created - prev.created;
    const dd = distanceCarLog(log, prev);
    log.dt = dt;
    log.dd = dd;
    totalDistance = totalDistance + dd;
    if (dd <= fRadiusOfArea) {
      continue;
    }
    if (index === lastIndex) {
      log.type = 'arrive';
      log.totalDistance = totalDistance;
      log.totalTime = log.created - departTime;
      calculated.push(log);
      continue;
    }
    if (prev.created !== 0 && dt >= iPeriodInMil) {
      if (isNotFirstArrival) {
        prev.type = 'arrive';
        prev.totalDistance = totalDistance;
        prev.totalTime = prev.created - departTime;
        calculated.push(prev);
      }
      isNotFirstArrival = true;
      totalDistance = 0.0;
      departTime = log.created;
      log.type = 'depart';
      log.totalDistance = 0;
      log.totalTime = 0;
      calculated.push(log);
    }
    prev = log;
  }
  return calculated;
};

export const distanceCarLog = (current, previous) => {
  return measure(
    previous.latitude,
    previous.longitude,
    current.latitude,
    current.longitude,
  );
};

export const showSimpleLocation = list => {
  const result = [];
  list.forEach(log => {
    const newLog = {
      date: log.date,
      type: log.type,
      created: log.created,
      dd: log.dd,
    };
    newLog.latitude = toFixed(log.latitude);
    newLog.longitude = toFixed(log.longitude);
    result.push(newLog);
  });
  return result;
};

export function initEmptyLocation() {
  const location = {};
  location.latitude = 0.0;
  location.longitude = 0.0;
  location.created = 0;
  return location;
}

export function positionToLocation(position) {
  const coords = position && position.coords;
  if (!coords) {
    return initEmptyLocation();
  }
  const locaiton = Object.assign({}, coords);
  locaiton.created = position.timestamp;
  return locaiton;
}

export function clone(item) {
  return Object.assign({}, {...item});
}

export function tripCallbackItemToTripRecord(item, isEndType = false) {
  const record = {};
  if (isEndType || item.type === TripType.END) {
    record.endLatitude = item.latitude;
    record.endLongitude = item.longitude;
    record.endCreated = item.created;
    record.totalDistance = item.totalDistance;
  } else {
    record.startLatitude = item.latitude;
    record.startLongitude = item.longitude;
    record.startCreated = item.created;
  }
  return record;
}

export const configureYearList = (minTimestamp, maxTimeStamp) => {
  const min = TimeUtil.timeToYearAndMonthValue(minTimestamp);
  const max = TimeUtil.timeToYearAndMonthValue(maxTimeStamp);
  // console.log('t min', min);
  // console.log('t max', max);
  const result = [];
  for (let year = min.year; year <= max.year; year++) {
    const yearData = {year: year, data: [], count: 0};
    for (let month = 1; month <= 12; month++) {
      // console.log('year', year, 'month', month);
      if (year === min.year && month < min.month) {
        continue;
      }
      if (year === max.year && month > max.month) {
        continue;
      }
      const monthData = {
        year: year,
        month: month,
        start: TimeUtil.yearMonthToTimestamp(year, month),
        end: TimeUtil.yearMonthToTimestamp(year, month + 1),
        count: 0,
      };
      yearData.data.push(monthData);
    }
    result.push(yearData);
  }
  return result;
};
