import {schemas, DatabaseManager, testWithRealm} from '../src/module/realm';

let db = null;

// function initializeDatabase() {
//   const config = {...schemas.getLatestConfig()};
//   config.inMemory = true;
//   db = new DatabaseManager(config);
//   console.log('db', db);
// }

// function clearDatabase() {
//   db.clearAllDatabase();
//   db = null;
// }

// beforeEach(() => {
//   initializeDatabase();
// });

// afterEach(() => {
//   clearDatabase();
// });

// test('DatabaseManager init', () => {
//   console.log('db.realm.path', db.realm.path);
// });

// async function saveCarLog() {
//   const latitude = 37.421998333333335;
//   const longitude = -122.08400000000002;
//   const timestamp = 1585211829000;
//   await db.saveCarLog(latitude, longitude, timestamp);
// }

// test('getCarLogList', async () => {
//   await saveCarLog();
//   const list = db.getCarLogList();
//   console.log('list', list);
// });

// async function savePerson() {
//   const firstName = 'Alex';
//   const lastName = 'Lee';
//   db.savePerson(firstName, lastName)
//     .then(person => {
//       console.log('person', JSON.stringify(person));
//     })
//     .catch(e => {
//       console.log(e);
//     });
// }

// test('getPersonList', async () => {
//   await savePerson();
//   const list = db.getPersonList();
//   console.log('list', list);
// });

test('testWithRealm', async () => {
  await testWithRealm();
});
