import {carLogs} from './data/car_log_20200331';
import {searchStartPositions, showStartPositions} from '../src/module/util';

it('search_start_position1', () => {
  const list = carLogs;
  const velocity = '1.0';
  const period = '20';
  const gpsErrorMargin = 300;
  const result = searchStartPositions(list, velocity, period, gpsErrorMargin);
  showStartPositions(result);
});
