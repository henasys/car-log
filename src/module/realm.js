const Realm = require('realm');

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

class Person {
  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

Person.schema = {
  name: 'Person',
  properties: {
    firstName: 'string',
    lastName: 'string',
  },
};

const schema0 = [CarLog, Person];

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
          try {
            const log = this.realm.create('CarLog', {
              latitude: latitude,
              longitude: longitude,
              created: created ? created : new Date().getTime(),
            });
            resolve(log);
          } catch (error) {
            console.warn(error);
            reject(new Error(error));
          }
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

  savePerson(firstName, lastName) {
    return new Promise((resolve, reject) => {
      try {
        console.log('realm', this.realm);
        console.log('realm.empty', this.realm.empty);
        console.log('realm.isClosed', this.realm.isClosed);
        console.log('realm.readOnly', this.realm.readOnly);
        console.log('realm.path', this.realm.path);
        console.log('realm.schemaVersion', this.realm.schemaVersion);
        console.log('realm.schema', this.realm.schema);
        this.realm.write(() => {
          const person = this.realm.create('Person', {
            firstName: firstName,
            lastName: lastName,
          });
          console.log('person', person);
          console.log('person.fullName', person.fullName);
          const list = this.realm.objects('Person');
          console.log('list.length', list.length);
          console.log('list.type', list.type);
          console.log('list.optional', list.optional);
          console.log('list.isEmpty', list.isEmpty());
          console.log('list.isValid', list.isValid());
          console.log('list.keys', [...list.keys()]);
          console.log('list.values', [...list.values()]);
          console.log('list', list);
          resolve(person);
        });
      } catch (e) {
        console.warn(e);
        reject(new Error(e));
      }
    });
  }

  getPersonList() {
    return this._getRealm().objects('Person');
  }
}

export function testWithRealm() {
  const config = {...schemas.getLatestConfig()};
  config.inMemory = true;
  Realm.open(config).then(realm => {
    console.log('testWithRealm realm', realm);
    console.log('realm.empty', realm.empty);
    realm.write(() => {
      const john = realm.create('Person', {
        firstName: 'John',
        lastName: 'Smith',
      });
      console.log('john', john);
      john.lastName = 'Peterson';
      console.log('john.fullName', john.fullName);
      const list = realm.objects('Person');
      console.log('list.length', list.length);
      console.log('list.type', list.type);
      console.log('list.optional', list.optional);
      console.log('list.isEmpty', list.isEmpty());
      console.log('list.isValid', list.isValid());
      console.log('list.keys', [...list.keys()]);
      console.log('list.values', [...list.values()]);
      console.log('list', list);
      list.forEach(p => {
        console.log('list p', p);
        console.log('list p.isValid()', p.isValid());
        console.log('list p.objectSchema()', p.objectSchema());
      });
    });
  });
}
