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

Setting.schema10 = {
  name: 'Setting',
  properties: {
    period: {type: 'int'},
    accuracyMargin: {type: 'double'},
    radiusOfArea: {type: 'double'},
    speedMargin: {type: 'double'},
  },
};

Setting.schema = {
  name: 'Setting',
  properties: {
    period: {type: 'int'},
    accuracyMargin: {type: 'double'},
    radiusOfArea: {type: 'double'},
    speedMargin: {type: 'double'},
    email: {type: 'string', optional: true},
  },
};

export class Trip {}

Trip.schema9 = {
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

Trip.schema11 = {
  name: 'Trip',
  primaryKey: 'id',
  properties: {
    id: {type: 'string'},
    startLatitude: {type: 'double'},
    startLongitude: {type: 'double'},
    startAddress: {type: 'string', optional: true},
    startCreated: {type: 'int'},
    endLatitude: {type: 'double', optional: true},
    endLongitude: {type: 'double', optional: true},
    endAddress: {type: 'string', optional: true},
    endCreated: {type: 'int', optional: true},
    totalDistance: {type: 'double', optional: true},
    totalTime: {type: 'int', optional: true},
    created: {type: 'int', indexed: true},
  },
};

Trip.schema12 = {
  name: 'Trip',
  primaryKey: 'id',
  properties: {
    id: {type: 'string'},
    startLatitude: {type: 'double'},
    startLongitude: {type: 'double'},
    startAddress: {type: 'string', optional: true},
    startCreated: {type: 'int', indexed: true},
    endLatitude: {type: 'double', optional: true},
    endLongitude: {type: 'double', optional: true},
    endAddress: {type: 'string', optional: true},
    endCreated: {type: 'int', indexed: true, optional: true},
    totalDistance: {type: 'double', optional: true},
    totalTime: {type: 'int', optional: true},
    created: {type: 'int', indexed: true},
  },
};

Trip.schema13 = {
  name: 'Trip',
  primaryKey: 'id',
  properties: {
    id: {type: 'string'},
    startLatitude: {type: 'double'},
    startLongitude: {type: 'double'},
    startAddress: {type: 'string', optional: true},
    startCreated: {type: 'int', indexed: true},
    endLatitude: {type: 'double', optional: true},
    endLongitude: {type: 'double', optional: true},
    endAddress: {type: 'string', optional: true},
    endCreated: {type: 'int', indexed: true, optional: true},
    totalDistance: {type: 'double', optional: true},
    totalTime: {type: 'int', optional: true},
    type: {type: 'int', indexed: true, default: 0},
    created: {type: 'int', indexed: true},
  },
};

Trip.schema = {
  name: 'Trip',
  primaryKey: 'id',
  properties: {
    id: {type: 'string'},
    startLatitude: {type: 'double'},
    startLongitude: {type: 'double'},
    startAddress: {type: 'string', optional: true},
    startCreated: {type: 'int', indexed: true},
    endLatitude: {type: 'double', optional: true},
    endLongitude: {type: 'double', optional: true},
    endAddress: {type: 'string', optional: true},
    endCreated: {type: 'int', indexed: true, optional: true},
    totalDistance: {type: 'double', optional: true},
    totalTime: {type: 'int', optional: true},
    purpose: {type: 'int', indexed: true, default: 0},
  },
};

Trip.PurposeType = {
  COMMUTE: 0,
  BUSINESS: 1,
  NON_BUSINESS: 2,
};

Trip.getPurposeTypeLabel = purpose => {
  switch (purpose) {
    case Trip.PurposeType.BUSINESS:
      return '업무';
    case Trip.PurposeType.NON_BUSINESS:
      return '비업무';
    default:
      return '출퇴근';
  }
};

const schema8 = [Location, Setting, Trip];
const schema9 = [Location, Setting, Trip.schema9];
const schema10 = [Location, Setting.schema10, Trip];
const schema11 = [Location, Setting, Trip.schema11];
const schema12 = [Location, Setting, Trip.schema12];
const schema13 = [Location, Setting, Trip.schema13];
const schema14 = [Location, Setting, Trip];

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

function migrationFunction14(oldRealm, newRealm) {
  console.log('migrationFunction14', oldRealm, newRealm);
  console.log('oldRealm.schemaVersion', oldRealm.schemaVersion);
  console.log('newRealm.schemaVersion', newRealm.schemaVersion);
  const oldObjects = oldRealm.objects('Trip');
  const newObjects = newRealm.objects('Trip');

  console.log('oldObjects', oldObjects.length);
  console.log('newObjects', newObjects.length);

  for (let i = 0; i < oldObjects.length; i++) {
    newObjects[i].purpose = oldObjects[i].type;
  }
}

export const schemas = [
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
  {
    schema: schema10,
    schemaVersion: 10,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema11,
    schemaVersion: 11,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema12,
    schemaVersion: 12,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema13,
    schemaVersion: 13,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema14,
    schemaVersion: 14,
    migration: migrationFunction14,
  },
];

schemas.getConfig = index => {
  const config = schemas[index];
  return config;
};

schemas.getLatestConfig = () => {
  return schemas.getConfig(schemas.length - 1);
};
