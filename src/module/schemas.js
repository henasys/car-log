import 'react-native-get-random-values';
import {v1 as uuidv1} from 'uuid';

export class CarLog {
  clone() {
    return Object.assign(new CarLog(), {...this});
  }
}

CarLog.schema2 = {
  name: 'CarLog',
  properties: {
    latitude: {type: 'double'},
    longitude: {type: 'double'},
    created: {type: 'int', indexed: true},
  },
};

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

export class Setting {}

Setting.schema1 = {
  name: 'Setting',
  properties: {
    velocity: {type: 'double'},
    period: {type: 'int'},
  },
};

Setting.schema3 = {
  name: 'Setting',
  properties: {
    velocity: {type: 'double'},
    period: {type: 'int'},
    gpsError: {type: 'int', default: 500},
  },
};

Setting.schema = {
  name: 'Setting',
  properties: {
    period: {type: 'int'},
    accuracyMargin: {type: 'double'},
    radiusOfArea: {type: 'double'},
  },
};

export class Position {}

Position.Type = {
  ERROR: {index: 0, label: 'ERROR'},
  DEPART: {index: 1, label: 'DEPART'},
  ARRIVE: {index: 2, label: 'ARRIVE'},
};

Position.getTypeIndex = index => {
  switch (index) {
    case Position.Type.DEPART.index:
      return Position.Type.DEPART;
    case Position.Type.ARRIVE.index:
      return Position.Type.ARRIVE;
    default:
      return Position.Type.ERROR;
  }
};

Position.getTypeLabel = label => {
  switch (label) {
    case Position.Type.DEPART.label:
      return Position.Type.DEPART;
    case Position.Type.ARRIVE.label:
      return Position.Type.ARRIVE;
    default:
      return Position.Type.ERROR;
  }
};

Position.schema4 = {
  name: 'Position',
  properties: {
    latitude: {type: 'double'},
    longitude: {type: 'double'},
    type: {type: 'int', indexed: true},
    distance: {type: 'double', default: 0},
    address: {type: 'string', optional: true},
    created: {type: 'int', indexed: true},
  },
};

Position.schema = {
  name: 'Position',
  primaryKey: 'id',
  properties: {
    id: {type: 'string'},
    latitude: {type: 'double'},
    longitude: {type: 'double'},
    type: {type: 'int', indexed: true},
    distance: {type: 'double', default: 0},
    address: {type: 'string', optional: true},
    created: {type: 'int', indexed: true},
  },
};

const schema0 = [CarLog];
const schema1 = [CarLog, Setting.schema1, Position];
const schema2 = [CarLog.schema2, Setting, Position];
const schema3 = [CarLog, Setting.schema3, Position];
const schema4 = [CarLog, Setting, Position.schema4];
const schema5 = [CarLog, Setting, Position];

function migrationFunctionNothing(oldRealm, newRealm) {
  console.log('migrationFunctionNothing', oldRealm, newRealm);
  console.log('oldRealm.schemaVersion', oldRealm.schemaVersion);
  console.log('newRealm.schemaVersion', newRealm.schemaVersion);
}

function migrationFunction4(oldRealm, newRealm) {
  const oldObjects = oldRealm.objects('Setting');
  const newObjects = newRealm.objects('Setting');

  for (let i = 0; i < oldObjects.length; i++) {
    newObjects[i].radiusOfArea = 100;
    newObjects[i].accuracyMargin = 40;
  }
}

function migrationFunction5(oldRealm, newRealm) {
  const oldObjects = oldRealm.objects('Position');
  const newObjects = newRealm.objects('Position');

  for (let i = 0; i < oldObjects.length; i++) {
    newObjects[i].id = uuidv1();
  }
}

export const schemas = [
  {
    schema: schema0,
    schemaVersion: 0,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema1,
    schemaVersion: 1,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema2,
    schemaVersion: 2,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema3,
    schemaVersion: 3,
    migration: migrationFunctionNothing,
  },
  {
    schema: schema4,
    schemaVersion: 4,
    migration: migrationFunction4,
  },
  {
    schema: schema5,
    schemaVersion: 5,
    migration: migrationFunction5,
  },
];

schemas.getConfig = index => {
  const config = schemas[index];
  return config;
};

schemas.getLatestConfig = () => {
  return schemas.getConfig(schemas.length - 1);
};
