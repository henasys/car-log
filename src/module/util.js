import moment from 'moment';
import 'moment/locale/ko';

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
