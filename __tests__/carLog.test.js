import {carLogs} from './data/car_log_20200331';
import {carLogs as carLogs2} from './data/car_log_data';
import {searchStartPositions, showStartPositions} from '../src/module/util';

it('search_start_position1', () => {
  const list = carLogs;
  const velocity = '1.0';
  const period = '30';
  const gpsErrorMargin = 500;
  const result = searchStartPositions(list, velocity, period, gpsErrorMargin);
  showStartPositions(result);
});

it('search_start_position2', () => {
  const list = carLogs2;
  const velocity = '1.0';
  const period = '30';
  const gpsErrorMargin = 1000;
  const result = searchStartPositions(list, velocity, period, gpsErrorMargin);
  showStartPositions(result);
});
