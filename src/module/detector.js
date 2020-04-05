import {distanceCarLog, timeToDateHourMin, msToTime} from '../module/util';

export const TripType = {
  START: 'START',
  END: 'END',
};

export class TripDetector {
  number = 0;
  isNotFirstArrival = false;
  totalDistance = 0;
  departTime = 0;
  result = [];

  constructor(period, accuracyMargin, radiusOfArea, speedMargin) {
    this.period = parseInt(period, 10) * 60 * 1000;
    this.accuracyMargin = parseFloat(accuracyMargin);
    this.radiusOfArea = parseFloat(radiusOfArea);
    this.speedMargin = parseFloat(speedMargin);
    this.initPrevLocation();
  }

  initPrevLocation() {
    this.prev = {};
    this.prev.latitude = 0.0;
    this.prev.longitude = 0.0;
    this.prev.created = 0;
  }

  setIsNotFirstArrival(isNotFirstArrival) {
    this.isNotFirstArrival = isNotFirstArrival;
  }

  setTotalDistance(totalDistance) {
    this.totalDistance = totalDistance;
  }

  setDepartTime(departTime) {
    this.departTime = departTime;
  }

  getResult() {
    return this.result;
  }

  getTotalDistance() {
    return this.totalDistance;
  }

  detectList(list) {
    if (list.length === 0) {
      return;
    }
    for (let index = 0; index < list.length; index++) {
      const current = this.cloneLocation(list[index]);
      this.prev = this.detect(current, this.prev);
    }
    this.makeArrrive(this.lastPrevious);
  }

  detect(current, prev) {
    const previous = this.cloneLocation(prev);
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
        this.makeArrrive(previous);
      }
      this.isNotFirstArrival = true;
      this.totalDistance = 0.0;
      this.departTime = current.created;
      this.makeDepart(current);
    }
    return current;
  }

  cloneLocation(item) {
    return Object.assign({}, {...item});
  }

  makeArrrive(item) {
    item.type = TripType.END;
    item.totalDistance = this.totalDistance;
    item.totalTime = item.created - this.departTime;
    item.number = this.number - 1;
    this.result.push(item);
  }

  makeDepart(item) {
    item.type = TripType.START;
    item.totalDistance = 0;
    item.totalTime = 0;
    item.number = this.number;
    this.result.push(item);
  }
}
