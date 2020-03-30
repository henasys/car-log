/**
 * original ref: https://www.tutorialspoint.com/The-Queue-Class-in-Javascript
 */

export class Queue {
  constructor(maxSize, isWarnPrint = false) {
    if (isNaN(maxSize)) {
      maxSize = 10;
    }
    this.maxSize = maxSize;
    this.isWarnPrint = isWarnPrint;
    this.container = [];
  }
  _log(msg) {
    if (this.isWarnPrint) {
      console.log(msg);
    }
  }
  display() {
    console.log(this.container);
  }
  isEmpty() {
    return this.container.length === 0;
  }
  isFull() {
    return this.container.length >= this.maxSize;
  }
  enqueue(element) {
    if (this.isFull()) {
      this._log('Queue Overflow!');
      this.container.shift();
    }
    this.container.push(element);
  }
  dequeue() {
    if (this.isEmpty()) {
      this._log('Queue Underflow!');
      return;
    }
    return this.container.shift();
  }
  peek() {
    if (this.isEmpty()) {
      this._log('Queue Underflow!');
      return;
    }
    return this.container[0];
  }
  clear() {
    this.container = [];
  }
  getAll() {
    return this.container;
  }
  getLast() {
    const length = this.container.length;
    if (length < 1) {
      return;
    }
    return this.container[length - 1];
  }
  getLastMinusOne() {
    const length = this.container.length;
    if (length < 2) {
      return;
    }
    return this.container[this.container.length - 2];
  }
}

const reducer = (accumulator, currentValue) => accumulator + currentValue;

export class LocationQueue {
  constructor(maxSize) {
    this.queue = new Queue(maxSize);
  }

  enqueue(location) {
    this.queue.enqueue(location);
  }

  averageOfLatitude() {
    const list = this.queue.getAll().map(x => x.latitude);
    if (list.length === 0) {
      return 0.0;
    }

    const sum = list.reduce(reducer);
    return sum / list.length;
  }

  averageOfLongitude() {
    const list = this.queue.getAll().map(x => x.longitude);
    if (list.length === 0) {
      return 0.0;
    }
    const sum = list.reduce(reducer);
    return sum / list.length;
  }

  deltaOfLatitude() {
    const last = this.queue.getLast();
    const minusOne = this.queue.getLastMinusOne();
    if (!last) {
      return 0.0;
    }
    if (!minusOne) {
      return last.latitude;
    }
    return last.latitude - minusOne.latitude;
  }

  deltaOfLongitude() {
    const last = this.queue.getLast();
    const minusOne = this.queue.getLastMinusOne();
    if (!last) {
      return 0.0;
    }
    if (!minusOne) {
      return last.longitude;
    }
    return last.longitude - minusOne.longitude;
  }
}
