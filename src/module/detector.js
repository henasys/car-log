import {
  distanceCarLog,
  timeToDateHourMin,
  msToTime,
  initEmptyLocation,
  clone,
} from '../module/util';

import {TripType} from '../module/type';

export class TripDetector {
  tripStartCallback = null;
  tripEndCallback = null;
  tripDrivingCallback = null;
  number = 0;
  allowTripEndAtFirst = false;
  totalDistance = 0;
  startTime = 0;
  result = [];
  previousLocation = initEmptyLocation();
  validPreviousLocation = null;
  isLocationChanged = false;
  allowToSkipPeriod = false;

  constructor(period, accuracyMargin, radiusOfArea, speedMargin) {
    this.setSetting({period, accuracyMargin, radiusOfArea, speedMargin});
  }

  setPeriod(period) {
    this.period = parseInt(period, 10) * 60 * 1000;
  }

  setAccuracyMargin(accuracyMargin) {
    this.accuracyMargin = parseFloat(accuracyMargin);
  }

  setRadiusOfArea(radiusOfArea) {
    this.radiusOfArea = parseFloat(radiusOfArea);
  }

  setSpeedMargin(speedMargin) {
    this.speedMargin = parseFloat(speedMargin);
  }

  setSetting({period, accuracyMargin, radiusOfArea, speedMargin}) {
    this.setPeriod(period);
    this.setAccuracyMargin(accuracyMargin);
    this.setRadiusOfArea(radiusOfArea);
    this.setSpeedMargin(speedMargin);
  }

  setTripStartCallback(callback) {
    this.tripStartCallback = callback;
  }

  setTripEndCallback(callback) {
    this.tripEndCallback = callback;
  }

  setTripDrivingCallback(callback) {
    this.tripDrivingCallback = callback;
  }

  setPreviousLocation(location = null) {
    this.previousLocation = location ? location : initEmptyLocation();
  }

  setAllowToSkipPeriod(skip = true) {
    console.log('setAllowToSkipPeriod', skip);
    this.allowToSkipPeriod = skip;
  }

  getAllowToSkipPeriod() {
    return this.allowToSkipPeriod;
  }

  /**
   * set first Trip End allowed or not
   * @param {*} flag true or false
   */
  setAllowTripEndAtFirst(flag) {
    console.log('setAllowTripEndAtFirst', flag);
    this.allowTripEndAtFirst = flag;
  }

  getPreviousLocation() {
    return this.previousLocation;
  }

  getIsLocationChanged() {
    return this.isLocationChanged;
  }

  setNumber(number) {
    this.number = number;
  }

  getNumber() {
    return this.number;
  }

  getResult() {
    return this.result;
  }

  clearResult() {
    this.result = [];
  }

  getTotalDistance() {
    return this.totalDistance;
  }

  getValidPreviousLocation() {
    return this.validPreviousLocation;
  }

  detectList(list) {
    if (list.length === 0) {
      return;
    }
    let prev = initEmptyLocation();
    for (let index = 0; index < list.length; index++) {
      const current = list[index];
      prev = this.detect(current, prev);
    }
    if (
      this.lastTripEnd &&
      this.lastTripEnd.created !== this.validPreviousLocation.created
    ) {
      this.makeTripEnd(clone(this.validPreviousLocation), true);
    } else {
      console.log('lastValidPreviousLocation is already added into TripEnd');
    }
  }

  /**
   * detect Trip at once, providing current location
   * this must be called after setPreviousLocation()
   * @param {} current location info from GPS
   */
  detectAtOnce(current) {
    const next = this.detect(current, this.previousLocation);
    this.isLocationChanged = next.created !== this.previousLocation.created;
    this.previousLocation = next;
  }

  detect(curr, prev) {
    const current = clone(curr);
    const previous = clone(prev);
    if (current.accuracy >= this.accuracyMargin) {
      return previous;
    }
    if (current.speed <= this.speedMargin) {
      return previous;
    }
    const validPrevious = previous;
    this.validPreviousLocation = validPrevious;
    const dt = current.created - validPrevious.created;
    const dd = distanceCarLog(current, validPrevious);
    current.dt = dt;
    current.dt_date = msToTime(dt);
    current.dd = dd;
    current.date = timeToDateHourMin(current.created);
    if (dd <= this.radiusOfArea) {
      // console.log('still stay in area', dd, this.radiusOfArea);
      this.makeTripDriving(current);
      return validPrevious;
    }
    this.totalDistance = this.totalDistance + dd;
    const startCondition = this.allowToSkipPeriod || dt >= this.period;
    console.log(
      'startCondition',
      startCondition,
      'allowToSkipPeriod',
      this.allowToSkipPeriod,
    );
    if (startCondition) {
      this.allowToSkipPeriod = false;
      this.number += 1;
      if (this.allowTripEndAtFirst) {
        this.makeTripEnd(validPrevious);
        this.lastTripEnd = validPrevious;
      }
      this.allowTripEndAtFirst = true;
      this.totalDistance = 0.0;
      this.startTime = current.created;
      this.makeTripStart(current);
    } else {
      this.makeTripDriving(current);
    }
    return current;
  }

  makeTripDriving(item) {
    item.type = TripType.DRIVING;
    item.totalDistance = this.totalDistance;
    item.totalTime = item.created - this.startTime;
    item.number = this.number;
    this.tripDrivingCallback && this.tripDrivingCallback(item);
  }

  makeTripEnd(item, isLast = false) {
    item.type = TripType.END;
    item.totalDistance = this.totalDistance;
    item.totalTime = item.created - this.startTime;
    if (isLast) {
      item.number = this.number;
      item.isLast = true;
      console.log('makeTripEnd with LastPrevious', item);
    } else {
      item.number = this.number - 1;
    }
    this.tripEndCallback && this.tripEndCallback(item);
    this.makeTripResult(item);
  }

  makeTripStart(item) {
    item.type = TripType.START;
    item.totalDistance = 0;
    item.totalTime = 0;
    item.number = this.number;
    this.tripStartCallback && this.tripStartCallback(item);
    this.makeTripResult(item);
  }

  makeTripResult(item) {
    let trip = this.findOrNewTrip(item.number);
    trip.number = item.number;
    if (item.type === TripType.START) {
      if (trip.start) {
        console.log('trip has a start point already', trip);
        return;
      }
      trip.start = item;
      this.result.push(trip);
    } else {
      if (trip.end) {
        console.log('trip has an end point already', trip);
        return;
      }
      trip.end = item;
    }
  }

  findOrNewTrip(number) {
    for (let index = 0; index < this.result.length; index++) {
      const trip = this.result[index];
      if (trip.number === number) {
        // console.log('trip found', number, trip);
        return trip;
      }
    }
    return {};
  }
}
