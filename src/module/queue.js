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
}
