import {distanceCarLog, timeToDateHourMin, msToTime} from '../module/util';
import {CarLog} from '../module/schemas';

export class EdgeDetector {
  number = 0;
  isNotFirstArrival = false;
  totalDistance = 0;
  departTime = 0;
  calculated = [];

  constructor(period, accuracyMargin, radiusOfArea, speedMargin) {
    this.period = parseInt(period, 10) * 60 * 1000;
    this.accuracyMargin = parseFloat(accuracyMargin);
    this.radiusOfArea = parseFloat(radiusOfArea);
    this.speedMargin = parseFloat(speedMargin);
    this.initPrevCarLog();
  }

  initPrevCarLog() {
    this.prev = new CarLog();
    this.prev.latitude = 0.0;
    this.prev.longitude = 0.0;
    this.prev.created = 0;
  }

  getResult() {
    return this.calculated;
  }

  detectList(list) {
    for (let index = 0; index < list.length; index++) {
      this.prev = this.detect(list[index].clone(), this.prev.clone());
    }
  }

  detect(current, previous) {
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
    this.totalDistance = this.totalDistance + dd;
    if (dd <= this.radiusOfArea) {
      return previous;
    }
    if (dt >= this.period) {
      this.number += 1;
      if (this.isNotFirstArrival) {
        previous.type = 'arrive';
        previous.totalDistance = this.totalDistance;
        previous.totalTime = previous.created - this.departTime;
        previous.number = this.number - 1;
        this.calculated.push(previous);
      }
      this.isNotFirstArrival = true;
      this.totalDistance = 0.0;
      this.departTime = current.created;
      current.type = 'depart';
      current.totalDistance = 0;
      current.totalTime = 0;
      current.number = this.number;
      this.calculated.push(current);
    }
    return current;
  }
}
