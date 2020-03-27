import {DatabaseManager} from '../src/module/realm';
import {schemas} from '../src/module/schemas';

let db = null;

function initializeDatabase() {
  const config = {...schemas.getLatestConfig()};
  config.inMemory = true;
  config.path = 'default.realm.inMemory';
  db = new DatabaseManager(config);
  console.log('db', db);
}

function clearDatabase() {
  db.clearAllDatabase();
  db = null;
}

beforeEach(() => {
  initializeDatabase();
});

afterEach(() => {
  clearDatabase();
});

test('DatabaseManager init', () => {
  console.log('db.realm.path', db.realm.path);
});

async function saveCarLog() {
  const latitude = 37.421998333333335;
  const longitude = -122.08400000000002;
  const timestamp = 1585211829000;
  await db.saveCarLog(latitude, longitude, timestamp);
}

test('getCarLogList', async () => {
  await saveCarLog();
  const list = db.getCarLogList();
  console.log('list', list);
  console.log('list.isEmpty', list.isEmpty());
  list.forEach(log => {
    console.log('log', log);
    console.log('log.latitude', log.latitude);
  });
});
