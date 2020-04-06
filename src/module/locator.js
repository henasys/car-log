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

  initLocator(callback = null, errorCallback = null) {
    this.watchPosition(callback, errorCallback);
  }

  removeLocator() {
    this.clearWatch();
  }

  getCurrentPosition(callback = null, errorCallback = null) {
    Geolocation.getCurrentPosition(
      position => {
        console.log('initPosition', position);
        callback && callback(position);
      },
      error => {
        console.log('getCurrentPosition Error', error);
        errorCallback && errorCallback(error);
      },
      this.options,
    );
  }

  watchPosition(callback = null, errorCallback = null) {
    this.watchID = Geolocation.watchPosition(
      position => {
        console.log('newPosition', position);
        callback && callback(position);
      },
      error => {
        console.log('watchPosition Error', error);
        errorCallback && errorCallback(error);
      },
      this.options,
    );
  }

  clearWatch() {
    this.watchID != null && Geolocation.clearWatch(this.watchID);
  }
}
