import {distanceCarLog} from '../module/util';

export class EdgeDetector {
  isNotFirstArrival = false;
  totalDistance = 0;
  departTime = 0;
  prev = {latitude: 0.0, longitude: 0.0, created: 0};
  calculated = [];

  constructor(period, accuracyMargin, radiusOfArea) {
    this.period = parseInt(period, 10) * 60 * 1000;
    this.accuracyMargin = parseFloat(accuracyMargin);
    this.radiusOfArea = parseFloat(radiusOfArea);
  }

  getResult() {
    return this.calculated;
  }

  detectList(list) {
    const lastIndex = list.length - 1;
    for (let index = 0; index < list.length; index++) {
      this.prev = this.detect(list[index], this.prev, index === lastIndex);
    }
  }

  detect(current, previous, isLastIndex = false) {
    if (current.accuracy >= this.accuracyMargin) {
      return previous;
    }
    const dt = current.created - previous.created;
    const dd = distanceCarLog(current, previous);
    current.dt = dt;
    current.dd = dd;
    this.totalDistance = this.totalDistance + dd;
    if (dd <= this.adiusOfArea) {
      return previous;
    }
    if (isLastIndex) {
      current.type = 'arrive';
      current.totalDistance = this.totalDistance;
      current.totalTime = current.created - this.departTime;
      this.calculated.push(current);
      return previous;
    }
    if (previous.created !== 0 && dt >= this.period) {
      if (this.isNotFirstArrival) {
        previous.type = 'arrive';
        previous.totalDistance = this.totalDistance;
        previous.totalTime = previous.created - this.departTime;
        this.calculated.push(previous);
      }
      this.isNotFirstArrival = true;
      this.totalDistance = 0.0;
      this.departTime = current.created;
      current.type = 'depart';
      current.totalDistance = 0;
      current.totalTime = 0;
      this.calculated.push(current);
    }
    return current;
  }
}
