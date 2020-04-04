import Realm from 'realm';
import 'react-native-get-random-values';
import {v1 as uuidv1} from 'uuid';

import {schemas} from '../module/schemas';
import {CarLog, Setting, Position} from '../module/schemas';

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

const saveCarLog = (
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
        const log = realm.create('CarLog', {
          latitude: latitude,
          longitude: longitude,
          speed: speed,
          heading: isNaN(heading) ? null : heading,
          accuracy: accuracy,
          created: created ? created : new Date().getTime(),
        });
        resolve(log);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const getCarLogList = realm => {
  return realm.objects('CarLog');
};

const saveSetting = (realm, period, accuracyMargin, radiusOfArea) => {
  return new Promise((resolve, reject) => {
    try {
      const iPeriod = parseInt(period, 10);
      const fAccuracyMargin = parseFloat(accuracyMargin);
      const fRadiusOfArea = parseFloat(radiusOfArea);
      realm.write(() => {
        const rs = realm.objects('Setting');
        if (!rs.isEmpty()) {
          const setting = rs[0];
          setting.accuracyMargin = fAccuracyMargin;
          setting.period = iPeriod;
          setting.radiusOfArea = fRadiusOfArea;
          resolve(setting);
          return;
        }
        const setting = realm.create('Setting', {
          accuracyMargin: fAccuracyMargin,
          period: iPeriod,
          radiusOfArea: fRadiusOfArea,
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

const savePosition = (realm, latitude, longitude, type, distance, created) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const position = realm.create('Position', {
          id: uuidv1(),
          latitude: latitude,
          longitude: longitude,
          type: type,
          distance: distance,
          created: created,
        });
        resolve(position);
      });
    } catch (e) {
      console.warn('realm.write', e);
      reject(new Error(e));
    }
  });
};

const getPositionList = realm => {
  return realm.objects('Position');
};

const updatePositionAddress = (realm, pk, address) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const rs = realm.objects('Position');
        if (!rs.isEmpty()) {
          const position = rs[0];
          position.address = address;
          resolve(position);
          return;
        }
        const msg = 'No Position ';
        console.warn(msg);
        reject(new Error(msg));
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
  CarLog,
  Setting,
  Position,
  open,
  close,
  saveCarLog,
  getCarLogList,
  saveSetting,
  getSetting,
  savePosition,
  getPositionList,
  updatePositionAddress,
  clearAllDatabase,
};
