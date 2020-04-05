import Realm from 'realm';
import 'react-native-get-random-values';
import {v1 as uuidv1} from 'uuid';

import {schemas} from '../module/schemas';
import {Location, Setting, Trip} from '../module/schemas';

const open = handler => {
  migrate();
  Realm.open(schemas.getLatestConfig())
    .then(realm => {
      handler && handler(realm);
    })
    .catch(e => {
      console.warn('Realm.open', e);
    });
};

const close = realm => {
  if (realm !== null && !realm.isClosed) {
    realm.close();
    // console.log('realm.close() done');
  }
};

const migrate = () => {
  const currentVersion = Realm.schemaVersion(Realm.defaultPath);
  const latestVersion = schemas.getLatestConfig().schemaVersion;
  if (currentVersion === -1) {
    return;
  }
  const goOrNot = currentVersion < latestVersion;
  if (!goOrNot) {
    return;
  }
  console.log('migrate start', goOrNot);
  console.log('currentVersion', currentVersion);
  console.log('latestVersion', latestVersion);
  let nextSchemaIndex = 0;
  while (nextSchemaIndex < schemas.length) {
    const config = schemas.getConfig(nextSchemaIndex);
    console.log('migrate config', nextSchemaIndex, config.schemaVersion);
    if (config.schemaVersion >= currentVersion) {
      let migratedRealm = null;
      try {
        migratedRealm = new Realm(config);
      } catch (e) {
        console.warn(e);
      } finally {
        if (migratedRealm) {
          migratedRealm.close();
        }
      }
    } else {
      console.log(
        'config.schemaVersion < currentVersion',
        config.schemaVersion,
        currentVersion,
      );
    }
    nextSchemaIndex += 1;
  }
};

const saveLocation = (
  realm,
  latitude,
  longitude,
  speed,
  heading,
  accuracy,
  created = null,
) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const location = realm.create('Location', {
          latitude: latitude,
          longitude: longitude,
          speed: speed,
          heading: isNaN(heading) ? null : heading,
          accuracy: accuracy,
          created: created ? created : new Date().getTime(),
        });
        resolve(location);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const getLocationList = realm => {
  return realm.objects('Location');
};

const saveSetting = (
  realm,
  period,
  accuracyMargin,
  radiusOfArea,
  speedMargin,
) => {
  return new Promise((resolve, reject) => {
    try {
      const iPeriod = parseInt(period, 10);
      const fAccuracyMargin = parseFloat(accuracyMargin);
      const fRadiusOfArea = parseFloat(radiusOfArea);
      const fSpeedMargin = parseFloat(speedMargin);
      realm.write(() => {
        const rs = realm.objects('Setting');
        if (!rs.isEmpty()) {
          const setting = rs[0];
          setting.accuracyMargin = fAccuracyMargin;
          setting.period = iPeriod;
          setting.radiusOfArea = fRadiusOfArea;
          setting.speedMargin = fSpeedMargin;
          resolve(setting);
          return;
        }
        const setting = realm.create('Setting', {
          accuracyMargin: fAccuracyMargin,
          period: iPeriod,
          radiusOfArea: fRadiusOfArea,
          speedMargin: fSpeedMargin,
        });
        resolve(setting);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const getSetting = realm => {
  const rs = realm.objects('Setting');
  if (rs.isEmpty()) {
    return null;
  }
  return rs[0];
};

/**
 * save Trip info
 * @param {*} realm Ream object
 * @param {*} start {latitude, longitude, created}
 * @param {*} end {latitude, longitude, created} optional
 * @param {*} totalDistance start ~ end, optional
 */
const saveTrip = (
  realm,
  start,
  end = {latitude: null, longitude: null, created: null},
  totalDistance = null,
) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const totalTime = end.created ? end.created - start.created : null;
        const trip = realm.create('Trip', {
          id: uuidv1(),
          startLatitude: start.latitude,
          startLongitude: start.longitude,
          startCreated: start.created,
          endLatitude: end.latitude,
          endLongitude: end.longitude,
          endCreated: end.created,
          totalDistance: totalDistance,
          totalTime: totalTime,
          created: new Date().getTime(),
        });
        resolve(trip);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const getTripList = realm => {
  return realm.objects('Trip');
};

/**
 * update Trip with end location info
 * @param {*} realm Ream object
 * @param {*} id Primary key
 * @param {*} end {latitude, longitude, created}
 * @param {*} totalDistance start ~ end
 */
const updateTripEnd = (realm, id, end, totalDistance) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const trip = realm.objectForPrimaryKey('Trip', id);
        const totalTime = end.created ? end.created - trip.startCreated : null;
        trip.endLatitude = end.latitude;
        trip.endLongitude = end.longitude;
        trip.endCreated = end.created;
        trip.totalDistance = totalDistance;
        trip.totalTime = totalTime;
        resolve(trip);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

/**
 * update Trip with address
 * @param {*} realm Realm Object
 * @param {*} id Primary key
 * @param {*} startAddress start address
 * @param {*} endAddress end address
 */
const updateTripAddress = (realm, id, startAddress, endAddress) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const trip = realm.objectForPrimaryKey('Trip', id);
        trip.startAddress = startAddress;
        trip.endAddress = endAddress;
        resolve(trip);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const clearAllDatabase = () => {
  return new Promise((resolve, reject) => {
    Realm.open(schemas.getLatestConfig())
      .then(realm => {
        try {
          realm.write(() => {
            realm.deleteAll();
            console.log('realm.deleteAll()');
            resolve();
          });
        } catch (e) {
          console.warn('realm.write', e);
          reject(new Error(e));
        }
      })
      .catch(e => {
        console.warn('Realm.open', e);
        reject(new Error(e));
      });
  });
};

export default {
  Location,
  Setting,
  Trip,
  open,
  close,
  saveLocation,
  getLocationList,
  saveSetting,
  getSetting,
  saveTrip,
  getTripList,
  updateTripEnd,
  updateTripAddress,
  clearAllDatabase,
};
