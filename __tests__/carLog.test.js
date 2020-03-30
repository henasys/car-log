import {carLogs} from './car_log_data';
import {measure} from '../src/module/util';

it('search_start_position', () => {
  let prevTime = 0;
  let prevLatitude = 0;
  let prevLongitude = 0;

  carLogs.forEach((log, index) => {
    const distance = measure(
      log.latitude,
      log.longitude,
      prevLatitude,
      prevLongitude,
    );
    if (index < 10) {
      console.log('distance', distance, log.dd);
    }

    prevTime = log.created;
    prevLatitude = log.latitude;
    prevLongitude = log.longitude;
  });
});
