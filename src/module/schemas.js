export class CarLog {
  clone() {
    return Object.assign(new CarLog(), {...this});
  }
}

CarLog.schema = {
  name: 'CarLog',
  properties: {
    latitude: {type: 'double'},
    longitude: {type: 'double'},
    speed: {type: 'double'},
    heading: {type: 'double', optional: true},
    accuracy: {type: 'double'},
    created: {type: 'int', indexed: true},
  },
};

export class Location {}

Location.schema = {
  name: 'Location',
  properties: {
    latitude: {type: 'double'},
    longitude: {type: 'double'},
    speed: {type: 'double'},
    heading: {type: 'double', optional: true},
    accuracy: {type: 'double'},
    created: {type: 'int', indexed: true},
  },
};

export class Setting {}

Setting.schema6 = {
  name: 'Setting',
  properties: {
    period: {type: 'int'},
    accuracyMargin: {type: 'double'},
    radiusOfArea: {type: 'double'},
  },
};

Setting.schema = {
  name: 'Setting',
  properties: {
    period: {type: 'int'},
    accuracyMargin: {type: 'double'},
    radiusOfArea: {type: 'double'},
    speedMargin: {type: 'double'},
  },
};

export class Trip {}

Trip.schema = {
  name: 'Trip',
  primaryKey: 'id',
  properties: {
    id: {type: 'string'},
    startLatitude: {type: 'double'},
    startLongitude: {type: 'double'},
    startAddress: {type: 'string', optional: true},
    startCreated: {type: 'int'},
    endLatitude: {type: 'double'},
    endLongitude: {type: 'double'},
    endAddress: {type: 'string', optional: true},
    endCreated: {type: 'int'},
    totalDistance: {type: 'double', default: 0},
    totalTime: {type: 'int'},
    created: {type: 'int', indexed: true},
  },
};

const schema6 = [CarLog, Setting.schema6, Trip];
const schema7 = [CarLog, Setting, Trip];
const schema8 = [Location, Setting, Trip];
const schema9 = [Location, Setting, Trip];

function migrationFunctionNothing(oldRealm, newRealm) {
  console.log('migrationFunctionNothing', oldRealm, newRealm);
  console.log('oldRealm.schemaVersion', oldRealm.schemaVersion);
  console.log('newRealm.schemaVersion', newRealm.schemaVersion);
}

function migrationFunction9(oldRealm, newRealm) {
  console.log('migrationFunction9', oldRealm, newRealm);
  console.log('oldRealm.schemaVersion', oldRealm.schemaVersion);
  console.log('newRealm.schemaVersion', newRealm.schemaVersion);
  const oldObjects = oldRealm.objects('CarLog');
  const newObjects = newRealm.objects('Location');

  console.log('oldObjects', oldObjects.length);
  console.log('newObjects', newObjects.length);

  for (let i = 0; i < oldObjects.length; i++) {
    newRealm.create('Location', {
      latitude: oldObjects[i].latitude,
      longitude: oldObjects[i].longitude,
      speed: oldObjects[i].speed,
      heading: oldObjects[i].heading,
      accuracy: oldObjects[i].accuracy,
      created: oldObjects[i].created,
    });
  }
}

export const schemas = [
  {
    schema: schema6,
    schemaVersion: 6,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema7,
    schemaVersion: 7,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema8,
    schemaVersion: 8,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema9,
    schemaVersion: 9,
    migration: migrationFunction9,
  },
];

schemas.getConfig = index => {
  const config = schemas[index];
  return config;
};

schemas.getLatestConfig = () => {
  return schemas.getConfig(schemas.length - 1);
};
