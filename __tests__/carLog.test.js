import {carLogs} from './data/car_log_20200401';
import {searchStartPositions, showStartPositions} from '../src/module/util';
import {
  detectSpeedZeroPoints,
  toFixed,
  timeToHourMin,
} from '../src/module/util';

it('search_start_position1', () => {
  const list = carLogs;
  const velocity = '1.0';
  const period = '20';
  const gpsErrorMargin = 300;
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
  console.log(result.slice(120, 130));
});
