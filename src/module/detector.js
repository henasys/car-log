import {
  distanceCarLog,
  timeToDateHourMin,
  msToTime,
  initEmptyLocation,
  clone,
} from '../module/util';

export const TripType = {
  START: 'START',
  END: 'END',
};

export class TripDetector {
  tripStartCallback = null;
  tripEndCallback = null;
  number = 0;
  isNotFirstArrival = false;
  totalDistance = 0;
  startTime = 0;
  result = [];

  constructor(period, accuracyMargin, radiusOfArea, speedMargin) {
    this.period = parseInt(period, 10) * 60 * 1000;
    this.accuracyMargin = parseFloat(accuracyMargin);
    this.radiusOfArea = parseFloat(radiusOfArea);
    this.speedMargin = parseFloat(speedMargin);
    this.initPrevLocation();
  }

  setTripStartCallback(callback) {
    this.tripStartCallback = callback;
  }

  setTripEndCallback(callback) {
    this.tripEndCallback = callback;
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

  getLastPrevious() {
    return this.lastPrevious;
  }

  detectList(list) {
    if (list.length === 0) {
      return;
    }
    for (let index = 0; index < list.length; index++) {
      const current = list[index];
      this.prev = this.detect(current, this.prev);
    }
    if (
      this.lastTripEnd &&
      this.lastTripEnd.created !== this.lastPrevious.created
    ) {
      this.makeTripEnd(clone(this.lastPrevious), true);
    } else {
      console.log('lastPrevious is already added into TripEnd');
    }
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
    const dt = current.created - previous.created;
    const dd = distanceCarLog(current, previous);
    current.dt = dt;
    current.dt_date = msToTime(dt);
    current.dd = dd;
    current.date = timeToDateHourMin(current.created);
    this.lastPrevious = previous;
    if (dd <= this.radiusOfArea) {
      return previous;
    }
    this.totalDistance = this.totalDistance + dd;
    if (dt >= this.period) {
      this.number += 1;
      if (this.isNotFirstArrival) {
        this.makeTripEnd(previous);
        this.lastTripEnd = previous;
      }
      this.isNotFirstArrival = true;
      this.totalDistance = 0.0;
      this.startTime = current.created;
      this.makeTripStart(current);
    }
    return current;
  }

  initPrevLocation() {
    this.prev = initEmptyLocation();
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
