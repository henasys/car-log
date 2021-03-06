import {carLogs} from './data/car_log_data_park';
import {searchStartPositions, showStartPositions} from '../src/module/util';
import {
  detectSpeedZeroPoints,
  toFixed,
  timeToHourMin,
  detectEdgePoints,
  showSimpleLocation,
} from '../src/module/util';
import {TripDetector} from '../src/module/detector';

it('search_start_position1', () => {
  const list = carLogs;
  const velocity = '1.0';
  const period = '20';
  const gpsErrorMargin = 100;
  const result = searchStartPositions(list, velocity, period, gpsErrorMargin);
  showStartPositions(result);
});

it('detectSpeedZeroPoints', () => {
  const result = detectSpeedZeroPoints(carLogs);
  result.forEach((zeros, index) => {
    console.log('Found zero point', index);
    zeros.forEach(log => {
      log.speed = toFixed(log.speed);
      log.heading = toFixed(log.heading);
      log.latitude = toFixed(log.latitude);
      log.longitude = toFixed(log.longitude);
      console.log(log);
    });
  });
});

it('print_data_for_map', () => {
  const result = [];
  carLogs.forEach((log, index) => {
    result.push({
      title: timeToHourMin(log.created),
      lat: log.latitude,
      lng: log.longitude,
    });
  });
  console.log(result.slice(164, 164 + 20));
});

it('histogram_accuracy', () => {
  const result = {};
  carLogs.forEach((log, index) => {
    const key = log.accuracy;
    if (key in result) {
      result[key] += 1;
    } else {
      result[key] = 1;
    }
  });
  console.log(result);
});

it('count_big_accuracy', () => {
  const value = 40;
  const result = [];
  carLogs.forEach((log, index) => {
    if (log.accuracy >= value) {
      result.push(log);
    }
  });
  console.log(result);
});

it('detectEdgePoints', () => {
  const list = carLogs;
  const periodInMin = '30';
  const accuracyMargin = '40';
  // const radiusOfArea = '100';
  const result = detectEdgePoints(
    list,
    periodInMin,
    accuracyMargin,
    // radiusOfArea,
  );
  console.log(showSimpleLocation(result));
  expect(result.length).toEqual(6);
});

it('detectEdgePointsClass', () => {
  const list = carLogs;
  const periodInMin = '30';
  const accuracyMargin = '40';
  const radiusOfArea = '100';
  const speedMargin = '0.0';
  const detector = new TripDetector(
    periodInMin,
    accuracyMargin,
    radiusOfArea,
    speedMargin,
  );
  detector.detectList(list);
  const result = detector.getResult();
  console.log(result);
  expect(result.length).toEqual(8);
});
