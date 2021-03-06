import Realm from 'realm';
import 'react-native-get-random-values';
import {v1 as uuidv1} from 'uuid';

import {schemas} from '../module/schemas';
import {Location, Setting, Trip} from '../module/schemas';
import {TimeUtil} from '../module/util';
import {configureYearMonthList, configureYearList} from '../module/util';

let _realm = null;

const setRealm = realm => {
  _realm = realm;
  console.log('setRealm', realm.schemaVersion);
};

const getRealm = () => {
  return _realm;
};

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

const getLocationListByTimestamp = (realm, start, end = null) => {
  let list = realm.objects('Location');
  if (end) {
    list = list.filtered('created >= $0 AND created < $1', start, end);
  } else {
    list = list.filtered('created >= $0', start);
  }
  return list;
};

const getLocationListByYear = (realm, year) => {
  const thisYear = TimeUtil.yearToTimestamp(year);
  const nextYear = TimeUtil.yearToTimestamp(year + 1);
  return getLocationListByTimestamp(realm, thisYear, nextYear);
};

const getLocationByYearMonth = (realm, year, month) => {
  const thisMonth = TimeUtil.yearMonthToTimestamp(year);
  const nextMonth = TimeUtil.yearMonthToTimestamp(year, month + 1);
  return getLocationListByTimestamp(realm, thisMonth, nextMonth);
};

const deleteLocationByYearMonth = (realm, year, month) => {
  const list =
    month === null
      ? getLocationListByYear(realm, year)
      : getLocationByYearMonth(realm, year, month);
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        realm.delete(list);
        resolve();
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const deleteLocationAll = realm => {
  const list = realm.objects('Location');
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        realm.delete(list);
        resolve();
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const saveSetting = (
  realm,
  period,
  accuracyMargin,
  radiusOfArea,
  speedMargin,
  email,
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
          setting.email = email;
          resolve(setting);
          return;
        }
        const setting = realm.create('Setting', {
          accuracyMargin: fAccuracyMargin,
          period: iPeriod,
          radiusOfArea: fRadiusOfArea,
          speedMargin: fSpeedMargin,
          email: email,
        });
        resolve(setting);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const getSetting = (realm, listener = null) => {
  const rs = realm.objects('Setting');
  listener && rs.addListener(listener);
  if (rs.isEmpty()) {
    return {
      period: 30,
      accuracyMargin: 40,
      radiusOfArea: 150,
      speedMargin: 0.1,
    };
  }
  return rs[0];
};

/**
 * save Trip info
 * @param {*} realm Ream object
 * @param {*} start {latitude, longitude, created}
 * @param {Number} purpose Trip.PurposeType Integer
 * @param {*} end {latitude, longitude, created} optional
 * @param {*} totalDistance start ~ end, optional
 */
const saveTrip = (
  realm,
  start,
  purpose = null,
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
          purpose: purpose ? purpose : Trip.PurposeType.COMMUTE,
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

const getEmptyAddressTripList = realm => {
  return realm
    .objects('Trip')
    .filtered(
      '(startLatitude != null AND startAddress = null) OR (endLatitude != null AND endAddress = null)',
    );
};
/**
 * TripList By Timestamp
 * @param {*} realm Realm object
 * @param {*} start timestamp start
 * @param {*} end timestamp not included
 * @param {*} reverse default false = descending order in sorted(descriptor, reverse)
 */
const getTripListByTimestamp = (realm, start, end, reverse = false) => {
  return realm
    .objects('Trip')
    .filtered('startCreated >= $0 AND startCreated < $1', start, end)
    .sorted('startCreated', reverse);
};

const getTripListByYear = (realm, year, reverse = false) => {
  const thisYear = TimeUtil.yearToTimestamp(year);
  const nextYear = TimeUtil.yearToTimestamp(year + 1);
  return getTripListByTimestamp(realm, thisYear, nextYear, reverse);
};

const getTripListByYearMonth = (realm, year, month, reverse = false) => {
  const thisMonth = TimeUtil.yearMonthToTimestamp(year, month);
  const nextMonth = TimeUtil.yearMonthToTimestamp(year, month + 1);
  return getTripListByTimestamp(realm, thisMonth, nextMonth, reverse);
};

/**
 * get min and max value of startCreated
 * @param {*} realm Realm object
 * @returns {*} {min, max} undefined if the collection is empty
 */
const getTripMinMax = realm => {
  const min = getTripList(realm).min('startCreated');
  // console.log('min', min, TimeUtil.timeToDateHourMin(min));
  const max = getTripList(realm).max('startCreated');
  // console.log('max', max, TimeUtil.timeToDateHourMin(max));
  return {min: min, max: max};
};

const getYearMonthListOfTrip = realm => {
  const {min, max} = getTripMinMax(realm);
  const yearList = configureYearMonthList(min, max);
  // console.log('yearLoop', yearList);
  yearList.forEach(year => {
    year.data.forEach(item => {
      const monthList = getTripListByTimestamp(realm, item.start, item.end);
      // console.log('count', monthList.length);
      item.count = monthList.length;
      // console.log('item', item);
      year.count += item.count;
    });
  });
  return yearList;
};

const getYearListOfTrip = realm => {
  const {min, max} = getTripMinMax(realm);
  const yearList = configureYearList(min, max);
  return yearList;
};

const getYearListOfTripForPicker = realm => {
  const yearList = getYearListOfTrip(realm);
  return yearList.map(year => {
    const item = {};
    item.label = `${year}년`;
    item.value = year;
    return item;
  });
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
 * update Trip with start address
 * @param {*} realm Realm Object
 * @param {*} id Primary key
 * @param {*} address start address
 */
const updateTripStartAddress = (realm, id, address) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const trip = realm.objectForPrimaryKey('Trip', id);
        trip.startAddress = address;
        resolve(trip);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

/**
 * update Trip with end address
 * @param {*} realm Realm Object
 * @param {*} id Primary key
 * @param {*} address end address
 */
const updateTripEndAddress = (realm, id, address) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const trip = realm.objectForPrimaryKey('Trip', id);
        trip.endAddress = address;
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
 * @param {*} purpose Trip.PurposeType
 */
const updateTripPurposeType = (realm, id, purpose) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const trip = realm.objectForPrimaryKey('Trip', id);
        trip.purpose = purpose;
        resolve(trip);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const mergeTrip = (realm, tripId, nextId) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const trip = realm.objectForPrimaryKey('Trip', tripId);
        const next = realm.objectForPrimaryKey('Trip', nextId);
        trip.endLatitude = next.endLatitude;
        trip.endLongitude = next.endLongitude;
        trip.endAddress = next.endAddress;
        trip.endCreated = next.endCreated;
        trip.totalDistance = trip.totalDistance + next.totalDistance;
        trip.totalTime = trip.totalDistance + next.totalDistance;
        realm.delete(next);
        resolve(trip);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const deleteTrip = (realm, year, month) => {
  const list =
    month === null
      ? getTripListByYear(realm, year)
      : getTripListByYearMonth(realm, year, month);
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        realm.delete(list);
        resolve();
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const deleteTripById = (realm, id) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const trip = realm.objectForPrimaryKey('Trip', id);
        realm.delete(trip);
        resolve();
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
  setRealm,
  getRealm,
  open,
  close,
  saveLocation,
  getLocationList,
  getLocationListByTimestamp,
  getLocationListByYear,
  getLocationByYearMonth,
  deleteLocationByYearMonth,
  deleteLocationAll,
  saveSetting,
  getSetting,
  saveTrip,
  getTripList,
  getEmptyAddressTripList,
  getTripListByTimestamp,
  getTripListByYear,
  getTripListByYearMonth,
  getTripMinMax,
  getYearMonthListOfTrip,
  getYearListOfTrip,
  getYearListOfTripForPicker,
  updateTripEnd,
  updateTripStartAddress,
  updateTripEndAddress,
  updateTripPurposeType,
  mergeTrip,
  deleteTrip,
  deleteTripById,
  clearAllDatabase,
};
