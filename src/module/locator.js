import Geolocation from '@react-native-community/geolocation';
import {Subject} from 'rxjs';

export class Locator {
  options = {
    enableHighAccuracy: true,
    timeout: 3000,
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

  getCurrentPosition(
    callback = null,
    errorCallback = null,
    isEmulator = false,
  ) {
    if (isEmulator) {
      const postion = {
        coords: {
          accuracy: 48,
          altitude: 68.60487305802874,
          heading: 0,
          latitude: 37.52223550001321,
          longitude: 126.99440221939722,
          speed: 4,
        },
        mocked: true,
        timestamp: new Date().getTime(),
      };
      callback && callback(postion);
      return;
    }
    Geolocation.getCurrentPosition(
      position => {
        console.log('initPosition', position);
        callback && callback(position);
      },
      error => {
        console.log('getCurrentPosition Error', error);
        errorCallback && errorCallback(error);
      },
      // this.options,
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
