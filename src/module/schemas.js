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
