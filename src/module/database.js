import Realm from 'realm';

import {schemas} from '../module/schemas';

const saveCarLog = (latitude, longitude, created = null) => {
  return new Promise((resolve, reject) => {
    Realm.open(schemas.getLatestConfig())
      .then(realm => {
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
      })
      .catch(e => {
        console.warn('Realm.open', e);
        reject(new Error(e));
      });
  });
};

const getCarLogList = () => {
  return new Promise((resolve, reject) => {
    Realm.open(schemas.getLatestConfig())
      .then(realm => {
        const list = realm.objects('CarLog');
        resolve(list);
      })
      .catch(e => {
        console.warn('Realm.open', e);
        reject(new Error(e));
      });
  });
};

export default {
  saveCarLog,
  getCarLogList,
};
