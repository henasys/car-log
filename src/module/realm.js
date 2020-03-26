import Realm from 'realm';

class CarLog {
  clone() {
    return Object.assign(new CarLog(), {...this});
  }
}

CarLog.schema = {
  name: 'CarLog',
  properties: {
    latitude: {type: 'double'},
    longitude: {type: 'double'},
    created: {type: 'int', indexed: true},
  },
};

const schema0 = [CarLog];

function migrationFunctionNothing(oldRealm, newRealm) {
  console.log('migrationFunctionNothing', oldRealm, newRealm);
  console.log('oldRealm.schemaVersion', oldRealm.schemaVersion);
  console.log('newRealm.schemaVersion', newRealm.schemaVersion);
}

export const schemas = [
  {
    schema: schema0,
    schemaVersion: 0,
    migration: migrationFunctionNothing,
  },
];

schemas.getConfig = index => {
  const config = schemas[index];
  return config;
};

schemas.getLatestConfig = () => {
  return schemas.getConfig(schemas.length - 1);
};

export class DatabaseManager {
  static instance;

  static getInstance() {
    // console.log('DatabaseManager.getInstance()');
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  constructor(newConfig = null) {
    // console.log('DatabaseManager.constructor()');
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
      try {
        const thisRealm = this._getRealm();
        thisRealm.write(() => {
          const log = thisRealm.create('CarLog', {
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
    return this._getRealm()
      .objects('CarLog')
      .sorted('created', false);
  }
}
