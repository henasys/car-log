/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {YellowBox} from 'react-native';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import {SafeAreaView} from 'react-native-safe-area-context';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {
  TimeUtil,
  positionToLocation,
  tripLocationToTripRecord,
  clone,
} from '../module/util';
import {toast, toastError} from '../module/toast';
import {TripDetector} from '../module/detector';
import FileManager from '../module/file';
import AndroidBackHandler from '../module/androidBackHandler';
import YearPicker from '../view/yearPicker';
import MonthPicker from '../view/monthPicker';
import TripList from '../view/tripListSwipeable';
import CurrentTrip from '../view/currentTrip2';

YellowBox.ignoreWarnings(['Setting a timer']);

export default class MainScreen extends React.Component {
  state = {
    realm: null,
    year: null,
    month: null,
    pickerItems: [],
    trip: {},
    list: null,
  };

  // timerInterval = null;
  periodInterval = null;
  locator = Locator.getInstance();
  setting = null;
  tripDetector = null;
  isEmulator = false;
  manualStartBackup = null;
  tripPurpose = null;
  focusEventUnsubscribe = null;
  blurEventUnsubscribe = null;
  isAttachedListener = false;

  componentDidMount() {
    console.log('main componentDidMount');
    this.initBackHandler();
    this.initDeviceInfo();
    this.openDatabase();
    this.locator.initLocator(
      this.handleOnLocation.bind(this),
      this.handleOnLocationError.bind(this),
    );
    this.getCurrentPosition();
  }

  componentWillUnmount() {
    console.log('main componentWillUnmount');
    this.removeBackHandler();
    this.clearPeriodInterval();
    this.closeDatabase();
    this.locator.removeLocator();
  }

  initBackHandler() {
    this.backHandler = new AndroidBackHandler();
    this.backHandler.addRoutesToBeStopped(['Main']);
    this.backHandler.initBackHandler();
  }

  removeBackHandler() {
    this.backHandler.removeBackHandler();
  }

  initDeviceInfo() {
    DeviceInfo.isEmulator()
      .then(isEmulator => {
        this.isEmulator = isEmulator;
        console.log('isEmulator', isEmulator);
      })
      .catch(e => {
        console.log(e);
      });
  }

  setPeriodInterval(realm) {
    const setting = Database.getSetting(realm);
    const intervalLimit = 15 * 60 * 1000;
    let interval = intervalLimit;
    if (setting && setting.period) {
      const intervalPeroid = (setting.period * 60 * 1000) / 2;
      if (intervalPeroid <= intervalLimit) {
        interval = intervalPeroid;
      }
    }
    console.log('setPeriodInterval', interval);
    this.periodInterval = setInterval(() => {
      console.log('run with setPeriodInterval()', moment().format('LLLL'));
      this.lastTripAutoEnd();
    }, interval);
  }

  clearPeriodInterval() {
    clearInterval(this.periodInterval);
  }

  setYear(year) {
    console.log('setYear', year);
    this.setState({year}, () => {
      this.getList();
    });
  }

  setMonth(month) {
    console.log('setMonth', month);
    this.setState({month}, () => {
      this.getList();
    });
  }

  setPickerItems(pickerItems) {
    this.setState({pickerItems});
  }

  openDatabase() {
    Database.open(realm => {
      this.setState({realm}, () => {
        realm.addListener('change', this.onChangeAtRealm.bind(this));
        Database.setRealm(realm);
        this.initPicker(realm);
        this.initTripDetector(realm);
        this.setPeriodInterval(realm);
        this.getRemainedLocationList(realm);
        this.getList(realm);
      });
    });
  }

  closeDatabase() {
    this.state.realm.removeAllListeners();
    Database.close(this.state.realm);
  }

  onChangeAtRealm(_realm, name, _schema) {
    console.log('onChangeAtRealm', _realm, name, _schema);
  }

  getCurrentPosition() {
    const callback = position => {
      const coords = position && position.coords;
      if (!coords) {
        return;
      }
      const msg = `init: ${coords.latitude}, ${coords.longitude}`;
      toast(msg);
    };
    const errorCallback = error => {
      const msg = `init: ${error.code}: ${error.message}`;
      toastError(msg);
    };
    this.locator.getCurrentPosition(callback, errorCallback);
  }

  initTripDetector(realm) {
    const setting = Database.getSetting(realm);
    this.setting = setting;
    // console.log('setting', setting);
    this.tripDetector = this.newTripDetector();
  }

  initPicker(realm) {
    const items = Database.getYearListOfTripForPicker(realm);
    console.log('pickerItems', items);
    this.setPickerItems(items);
  }

  getList(_realm = null) {
    console.log('main getList');
    const {year, month} = this.state;
    const realm = _realm ? _realm : this.state.realm;
    if (!realm) {
      return;
    }
    const trips =
      year && month
        ? Database.getTripListByYearMonth(realm, year, month + 1, true)
        : Database.getTripList(this.state.realm).sorted('startCreated', true);
    // this.deleteTrips(list);
    // this.writeJsonToFile(list);
    // this.readJsonFromFile();
    const list = trips.filtered('endCreated != null');
    console.log('getList list', list.length);
    // list.removeListener(this.listListener.bind(this));
    // list.addListener(this.listListener.bind(this));
    if (!this.isAttachedListener) {
      console.log('this.isAttachedListener is false, very initial state');
      this.isAttachedListener = true;
      list.addListener(this.listListener.bind(this));
    }
    this.setState({list});
  }

  listListener(list, changes) {
    console.log('main listListener', changes);
    if (changes.deletions.length > 0) {
      console.log('changes.deletions exists');
      this.setState({list});
    }
    if (changes.modifications.length > 0) {
      console.log('changes.modifications exists');
      this.setState({list});
    }
  }

  // test purpose only
  deleteTrips(list) {
    const deleteList = list.filtered('startCreated >= $0', 1586221200000);
    console.log('deleteList', deleteList);
    try {
      this.state.realm.write(() => {
        this.state.realm.delete(deleteList);
      });
    } catch (error) {
      console.log(error);
    }
  }

  filename = 'trip_data_backup.json';

  writeJsonToFile(list) {
    const json = JSON.stringify(list);
    FileManager.writeToTemp(this.filename, json)
      .then(() => {
        console.log('writeJsonToFile done');
      })
      .catch(e => {
        console.log(e);
      });
  }

  readJsonFromFile() {
    FileManager.readFromTemp(this.filename)
      .then(json => {
        console.log('readJsonFromFile done', json.slice(0, 300));
      })
      .catch(e => {
        console.log(e);
      });
  }

  getRemainedLocationList(realm) {
    const lastTrip = this.getLastTrip(realm);
    const lastTimestamp =
      (lastTrip && lastTrip.endCreated) ||
      (lastTrip && lastTrip.startCreated) ||
      0;
    if (lastTrip && lastTrip.startCreated && !lastTrip.endCreated) {
      this.newTrip(lastTrip);
    }
    const locations = Database.getLocationListByTimestamp(
      realm,
      lastTimestamp,
    ).sorted('created', false);
    // console.log('to be processing locations', locations.map(x => x.created));
    console.log('to be processing locations', locations.length);
    // this.testNewLocation();
    this.doDetectOnRemainedLocationList(realm, locations, lastTimestamp);
  }

  getLastTrip(realm) {
    const list = Database.getTripList(realm)
      .sorted('startCreated', true)
      .slice(0, 1);
    const lastTrip = list.length === 1 ? list[0] : null;
    console.log('lastTrip', lastTrip);
    return lastTrip;
  }

  doDetectOnRemainedLocationList(realm, locations, lastTimestamp) {
    if (locations.length === 0) {
      return;
    }
    let indexStart = 0;
    if (lastTimestamp === 0) {
      this.tripDetector.setPreviousLocation();
    } else {
      this.tripDetector.setPreviousLocation(locations[0]);
      indexStart = 1;
    }
    for (let index = indexStart; index < locations.length; index++) {
      const location = locations[index];
      this.tripDetector.detectAtOnce(location);
    }
    const previousLocation = this.tripDetector.getPreviousLocation();
    previousLocation.totalDistance = this.tripDetector.getTotalDistance();
    const updateTrip = tripLocationToTripRecord(previousLocation, true);
    this.updateTrip(updateTrip);
    const result = this.tripDetector.getResult();
    console.log('doDetectOnRemainedLocationList result', result.length);
    const afterCallback = _realm => {
      this.lastTripAutoEnd(_realm);
      this.setTripDetectorCallback();
    };
    this.saveTripResult(realm, result, afterCallback);
  }

  lastTripAutoEnd(_realm = null) {
    console.log('lastTripAutoEnd');
    const realm = _realm ? _realm : this.state.realm;
    const lastTrip = this.getLastTrip(realm);
    if (!lastTrip || lastTrip.endCreated) {
      console.log('no lastTrip has empty end');
      return;
    }
    const lastPrevious = this.getLastPreviousOfDetector();
    const referTimestamp = Math.max(
      lastTrip.startCreated,
      lastPrevious.created,
    );
    const item = {
      id: lastTrip.id,
      latitude: lastPrevious.latitude,
      longitude: lastPrevious.longitude,
      totalDistance: lastPrevious.totalDistance,
      created: referTimestamp,
    };
    const nowTimestamp = new Date().getTime();
    console.log('nowTimestamp', nowTimestamp);
    const dt = nowTimestamp - referTimestamp;
    console.log('referTimestamp', referTimestamp);
    console.log('dt', dt, TimeUtil.msToTime(dt));
    const period = this.setting.period * 60 * 1000;
    if (lastPrevious.created === 0 || dt < period) {
      return;
    }
    console.log('lastTrip auto ending required');
    this.updateTripEnd(item, realm);
  }

  getLastPreviousOfDetector() {
    const previousLocation = this.tripDetector.getPreviousLocation();
    let lastPrevious = this.tripDetector.getLastValidPreviousLocation();
    const totalDistance = this.tripDetector.getTotalDistance();
    console.log('previousLocation', previousLocation);
    console.log('lastPrevious', lastPrevious);
    console.log('totalDistance', totalDistance);
    if (!lastPrevious) {
      lastPrevious = {...previousLocation};
    }
    const location = clone(lastPrevious);
    location.totalDistance = totalDistance;
    return location;
  }

  saveTripResult(realm, result, afterCallback) {
    if (result.length === 0) {
      afterCallback(realm);
      return;
    }
    const lastIndex = result.length - 1;
    for (let index = 0; index < result.length; index++) {
      const trip = result[index];
      Database.saveTrip(
        realm,
        trip.start,
        null,
        trip.end,
        trip.end && trip.end.totalDistance,
      )
        .then(newTrip => {
          console.log('saveTrip done', newTrip);
          if (index === lastIndex) {
            this.newTrip(newTrip);
          }
        })
        .catch(e => {
          console.log('saveTrip error', e);
        })
        .finally(() => {
          if (index === lastIndex) {
            afterCallback(realm);
          }
        });
    }
  }

  tripStartCallback = item => {
    console.log(
      'tripStartCallback',
      item.created,
      TimeUtil.timeToDateHourMin(item.created),
    );
    console.log(item);
    if (this.manualStartBackup) {
      console.log('manualStartBackup true');
      const trip = this.manualStartBackup;
      trip.number = item.number;
      this.newTrip(trip);
      this.manualStartBackup = null;
      return;
    }
    Database.saveTrip(this.state.realm, item, this.tripPurpose)
      .then(trip => {
        console.log('saveTrip done', trip);
        trip.number = item.number;
        this.newTrip(trip);
      })
      .catch(e => {
        console.log('saveTrip error', e);
      });
  };

  tripEndCallback = item => {
    console.log(
      'tripEndCallback',
      item.created,
      TimeUtil.timeToDateHourMin(item.created),
    );
    console.log(item);
    if (this.manualStartBackup) {
      console.log('manualStartBackup true');
      return;
    }
    const {trip} = this.state;
    if (!trip || !trip.id) {
      console.log('not found current trip id', trip);
      return;
    }
    item.id = trip.id;
    this.updateTripEnd(item);
  };

  newTripDetector() {
    const detector = new TripDetector(
      this.setting.period,
      this.setting.accuracyMargin,
      this.setting.radiusOfArea,
      this.setting.speedMargin,
    );
    return detector;
  }

  setTripDetectorCallback() {
    this.tripDetector.setTripStartCallback(this.tripStartCallback);
    this.tripDetector.setTripEndCallback(this.tripEndCallback);
  }

  handleOnLocation(position) {
    const coords = position && position.coords;
    if (!coords) {
      return;
    }
    this.handleWithDetector(positionToLocation(position));
    Database.saveLocation(
      this.state.realm,
      coords.latitude,
      coords.longitude,
      coords.speed,
      coords.heading,
      coords.accuracy,
      position.timestamp,
    )
      .then(log => {
        console.log('saveLocation done', log);
        const msg = `${coords.latitude}, ${coords.longitude}`;
        toast(msg);
        const updater = this.locator.getUpdater();
        updater.next(coords);
      })
      .catch(e => {
        console.log('saveLocation', e);
      });
  }

  handleOnLocationError(error) {
    const msg = `${error.code}: ${error.message}`;
    toastError(msg);
  }

  testNewLocation() {
    const location = {
      accuracy: 10,
      altitude: 68.0428826137193,
      heading: 0,
      latitude: 37.53006144198941 + 0.5,
      longitude: 126.99286469807542 + 1.0,
      speed: 5,
      created: new Date().getTime(),
    };
    setTimeout(() => {
      console.log('testNewLocation');
      this.handleWithDetector(location, true);
    }, 3000);
  }

  handleWithDetector(current, isTest = false) {
    console.log('handleWithDetector', current.created);
    if (!this.tripDetector) {
      return;
    }
    this.tripDetector.detectAtOnce(current);
    const previousLocation = this.tripDetector.getPreviousLocation();
    const totalDistance = this.tripDetector.getTotalDistance();
    const isLocationChanged = this.tripDetector.getIsLocationChanged();
    console.log('previousLocation', previousLocation);
    console.log('totalDistance', totalDistance);
    if (isTest || isLocationChanged) {
      const location = clone(previousLocation);
      location.totalDistance = isTest ? 10000 : totalDistance;
      const updateTrip = tripLocationToTripRecord(location, true);
      this.updateTrip(updateTrip);
    }
  }

  newTrip(newTrip) {
    const trip = clone(newTrip);
    if (trip.purpose) {
      this.tripPurpose = trip.purpose;
    } else if (this.tripPurpose) {
      trip.purpose = this.tripPurpose;
    } else {
      trip.purpose = Database.Trip.PurposeType.COMMUTE;
    }
    console.log('newTrip', trip);
    this.setState({trip: trip});
  }

  updateTrip(updateTrip) {
    const {trip} = this.state;
    this.setState({trip: {...trip, ...updateTrip}});
  }

  onStartButton() {
    console.log('onStartButton');
    const callback = position => {
      const coords = position && position.coords;
      if (!coords) {
        const msg = 'GPS 정보 획득 실패, 잠시 후 다시 시도해주세요.';
        toast(msg);
        return;
      }
      console.log('getCurrentPosition', coords);
      const item = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        created: new Date().getTime(),
      };
      console.log('item', item);
      let tripNumber = this.tripDetector.getNumber();
      Database.saveTrip(this.state.realm, item, this.tripPurpose)
        .then(trip => {
          console.log('saveTrip done', trip);
          tripNumber += 1;
          this.tripDetector.setNumber(tripNumber);
          trip.number = tripNumber;
          this.newTrip(trip);
          this.manualStartBackup = trip;
        })
        .catch(e => {
          console.log('saveTrip error', e);
        });
    };
    const errorCallback = error => {
      const msg = `${error.code}: ${error.message}`;
      toastError(msg);
    };
    this.locator.getCurrentPosition(callback, errorCallback, this.isEmulator);
  }

  onEndButton() {
    console.log('onEndButton');
    const callback = position => {
      const coords = position && position.coords;
      if (!coords) {
        const msg = 'GPS 정보 획득 실패, 잠시 후 다시 시도해주세요.';
        toast(msg);
        return;
      }
      console.log('getCurrentPosition', coords);
      const {trip} = this.state;
      if (!trip || !trip.id) {
        console.log('not found current trip id', trip);
        return;
      }
      const item = {
        id: trip.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
        created: new Date().getTime(),
        totalDistance: trip.totalDistance,
        number: trip.number,
      };
      const lastPrevious = this.getLastPreviousOfDetector();
      if (lastPrevious.created >= trip.startCreated) {
        item.latitude = lastPrevious.latitude;
        item.longitude = lastPrevious.longitude;
        item.created = lastPrevious.created;
        item.totalDistance = lastPrevious.totalDistance;
      }
      this.updateTripEnd(item);
    };
    const errorCallback = error => {
      const msg = `${error.code}: ${error.message}`;
      toastError(msg);
    };
    this.locator.getCurrentPosition(callback, errorCallback, this.isEmulator);
  }

  updateTripEnd(item, _realm = null) {
    const realm = _realm ? _realm : this.state.realm;
    if (!item || !item.id) {
      console.log('not found current trip id', item);
      return;
    }
    Database.updateTripEnd(realm, item.id, item, item.totalDistance)
      .then(updatedTrip => {
        console.log('updateTripEnd done', updatedTrip);
        this.newTrip({});
      })
      .catch(e => {
        console.log('updateTripEnd error', e);
      });
  }

  onTripPurposeChanged(purpose) {
    console.log('onTripPurposeChanged', purpose);
    this.tripPurpose = purpose;
    this.updateTrip({purpose});
    const {realm, trip} = this.state;
    if (!trip || !trip.id) {
      return;
    }
    Database.updateTripPurposeType(realm, trip.id, purpose)
      .then(newTrip => {
        console.log('updateTripPurposeType done', newTrip.id);
      })
      .catch(e => {
        console.log('updateTripPurposeType error', e);
      });
  }

  onDeleteRow(rowKey) {
    Database.deleteTripById(this.state.realm, rowKey)
      .then(() => {
        console.log('Database.deleteTripById done', rowKey);
      })
      .catch(e => {
        console.log('Database.deleteTripById error', rowKey, e);
      });
  }

  onSetList(newList) {
    console.log('onSetList', newList.length);
    this.setState({list: newList});
  }

  onMergeRow(tripId, nextId, rowIndex) {
    console.log('onMergeRow');
    Database.mergeTrip(this.state.realm, tripId, nextId)
      .then(trip => {
        console.log('Database.mergeTrip done', tripId);
        const newList = [...this.state.list];
        newList[rowIndex] = trip;
        newList.splice(rowIndex - 1, 1);
        this.onSetList(newList);
      })
      .catch(e => {
        console.log('Database.mergeTrip error', tripId, e);
      });
  }

  render() {
    console.log('main render');
    const {trip, list, year, month, pickerItems, realm} = this.state;
    // console.log('list', list.length);
    console.log('trip', trip);
    // console.log('year', year, 'month', month);
    return (
      <SafeAreaView style={styles.container}>
        <CurrentTrip
          navigation={this.props.navigation}
          trip={trip}
          onTripPurposeChanged={this.onTripPurposeChanged.bind(this)}
          onStartButton={this.onStartButton.bind(this)}
          onEndButton={this.onEndButton.bind(this)}
        />
        <View style={styles.yearMonthPickerContainer}>
          <View style={{width: '45%'}}>
            <YearPicker
              year={year}
              items={pickerItems}
              setYear={this.setYear.bind(this)}
            />
          </View>
          <View style={{paddingHorizontal: 5}} />
          <View style={{width: '45%'}}>
            <MonthPicker month={month} setMonth={this.setMonth.bind(this)} />
          </View>
        </View>
        <View style={styles.ListContainer}>
          <TripList
            list={list}
            realm={realm}
            onDeleteRow={this.onDeleteRow.bind(this)}
            onSetList={this.onSetList.bind(this)}
            onMergeRow={this.onMergeRow.bind(this)}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ListContainer: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: 'white',
  },
  yearMonthPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginHorizontal: 10,
    marginVertical: 10,
  },
});
