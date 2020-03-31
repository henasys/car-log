import Geolocation from '@react-native-community/geolocation';

export class Locator {
  options = {
    enableHighAccuracy: true,
    timeout: 2000,
  };

  constructor(options = null) {
    if (!options) {
      this.options = options;
    }
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
