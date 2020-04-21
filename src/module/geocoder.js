import Geocoder from 'react-native-geocoding';

export default class GoogleGeocoder {
  constructor(apiKey, options = {}) {
    Geocoder.init(apiKey, options);
  }

  getAddress(latitude, longitude, callback = null, errorCallback = null) {
    Geocoder.from(latitude, longitude)
      .then(json => {
        console.log(JSON.stringify(json));
        if (json.result && json.result.length > 0) {
          const address = json.result[0];
          callback && callback(address.formatted_address);
        }
      })
      .catch(e => {
        console.log('Geocoder error', e);
        errorCallback && errorCallback(e);
      });
  }
}
