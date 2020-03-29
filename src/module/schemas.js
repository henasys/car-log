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

class Setting {}

Setting.schema = {
  name: 'Setting',
  properties: {
    velocity: {type: 'double'},
    period: {type: 'int'},
  },
};

class Position {}

Position.Type = {
  ERROR: 0,
  START: 1,
  END: 2,
};

Position.schema = {
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

const schema0 = [CarLog];
const schema1 = [CarLog, Setting, Position];

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
