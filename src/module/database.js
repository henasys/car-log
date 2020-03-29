import Realm from 'realm';

import {schemas} from '../module/schemas';

const open = handler => {
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
    console.log('realm.close() done');
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
  clearAllDatabase,
};
