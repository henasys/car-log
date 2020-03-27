import Realm from 'realm';

import {schemas} from '../module/schemas';

export class DatabaseManager {
  static instance;

  static getInstance() {
    console.log('DatabaseManager.getInstance()');
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  realm = null;

  constructor(newConfig = null) {
    console.log('DatabaseManager.constructor()');
    if (newConfig) {
      this.realm = new Realm(newConfig);
    } else {
      this.migrate();
      const config = schemas.getLatestConfig();
      this.realm = new Realm(config);
      console.log('config', config);
    }
  }

  _getRealm() {
    if (this.realm && this.realm.isClosed === false) {
      return this.realm;
    }
    console.log('Access error to closed, so reopen Realm');
    const config = schemas.getLatestConfig();
    this.realm = new Realm(config);
    return this.realm;
  }

  migrate() {
    console.log('DatabaseManager.migrate()');
    if (this.realm) {
      this.realm.close();
    }
    const currentVersion = Realm.schemaVersion(Realm.defaultPath);
    const latestVersion = schemas.getLatestConfig().schemaVersion;
    console.log('currentVersion', currentVersion);
    console.log('latestVersion', latestVersion);
    console.log('schemas.length', schemas.length);
    if (currentVersion === -1) {
      return;
    }
    const goOrNot = currentVersion < latestVersion;
    console.log('migrate go_or_not', goOrNot);
    if (!goOrNot) {
      return;
    }
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
  }

  clearAllDatabase() {
    const thisRealm = this._getRealm();
    thisRealm.write(() => {
      thisRealm.deleteAll();
      console.log('realm.deleteAll()');
    });
  }

  saveCarLog(latitude, longitude, created = null) {
    return new Promise((resolve, reject) => {
      // console.log('realm', this.realm);
      // console.log('realm.empty', this.realm.empty);
      // console.log('realm.isClosed', this.realm.isClosed);
      // console.log('realm.readOnly', this.realm.readOnly);
      // console.log('realm.path', this.realm.path);
      // console.log('realm.schemaVersion', this.realm.schemaVersion);
      // console.log('realm.schema', this.realm.schema);
      try {
        this.realm.write(() => {
          const log = this.realm.create('CarLog', {
            latitude: latitude,
            longitude: longitude,
            created: created ? created : new Date().getTime(),
          });
          resolve(log);
        });
      } catch (e) {
        console.warn(e);
        reject(new Error(e));
      }
    });
  }

  getCarLogList() {
    return this.realm.objects('CarLog').sorted('created', false);
  }
}
