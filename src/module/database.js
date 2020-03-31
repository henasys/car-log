import Realm from 'realm';

import {schemas} from '../module/schemas';

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

const saveCarLog = (realm, latitude, longitude, created = null) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const log = realm.create('CarLog', {
          latitude: latitude,
          longitude: longitude,
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

const saveSetting = (realm, velocity, period, gpsError) => {
  return new Promise((resolve, reject) => {
    const fVelocity = parseFloat(velocity);
    const iPeriod = parseInt(period, 10);
    const iGpsError = parseInt(gpsError, 10);
    try {
      realm.write(() => {
        const rs = realm.objects('Setting');
        if (!rs.isEmpty()) {
          const setting = rs[0];
          setting.velocity = fVelocity;
          setting.period = iPeriod;
          setting.gpsError = iGpsError;
          resolve(setting);
          return;
        }
        const setting = realm.create('Setting', {
          velocity: fVelocity,
          period: iPeriod,
          gpsError: iGpsError,
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
