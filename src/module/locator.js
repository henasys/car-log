import Geolocation from '@react-native-community/geolocation';
import {Subject} from 'rxjs';

export class Locator {
  options = {
    enableHighAccuracy: true,
    timeout: 10000,
  };

  static instance;

  static getInstance() {
    // console.log('Locator.getInstance()');
    if (!Locator.instance) {
      Locator.instance = new Locator();
    }
    return Locator.instance;
  }

  constructor() {
    this.updater = new Subject();
  }

  setOptions(options) {
    this.options = options;
  }

  getOptions() {
    return this.options;
  }

  getUpdater() {
    return this.updater;
  }

  initLocator(callback = null) {
    this.watchPosition(callback);
  }

  removeLocator() {
    this.clearWatch();
  }

  getCurrentPosition(callback = null) {
    Geolocation.getCurrentPosition(
      position => {
        console.log('initPosition', position);
        callback && callback(position);
      },
      error => console.log('getCurrentPosition Error', error),
      this.options,
    );
  }

  watchPosition(callback = null) {
    this.watchID = Geolocation.watchPosition(
      position => {
        console.log('lastPosition', position);
        callback && callback(position);
      },
      error => console.log('watchPosition Error', error),
      this.options,
    );
  }

  clearWatch() {
    this.watchID != null && Geolocation.clearWatch(this.watchID);
  }
}
