/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, Text, View, FlatList, SafeAreaView} from 'react-native';
import {YellowBox} from 'react-native';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {
  TimeUtil,
  toFixed,
  positionToLocation,
  tripCallbackItemToTripRecord,
  getKilometers,
} from '../module/util';
import {toast} from '../module/toast';
import {TripDetector} from '../module/detector';
import FileManager from '../module/file';
import YearPicker from '../view/yearPicker';
import MonthPicker from '../view/monthPicker';
import TripButton from '../view/tripButton';
import TripTypeButton from '../view/tripTypeButton';
import color from '../module/color';

YellowBox.ignoreWarnings(['Setting a timer']);

export default class MainScreen extends React.Component {
  state = {
    realm: null,
    year: null,
    month: null,
    pickerItems: [],
    trip: {},
    list: [],
    today: moment(),
  };

  timerInterval = null;
  periodInterval = null;
  locator = Locator.getInstance();
  setting = null;
  tripDetector = null;
  isEmulator = false;
  manualStartBackup = null;
  tripType = null;

  componentDidMount() {
    console.log('main componentDidMount');
    this.initDeviceInfo();
    this.setTimerInterval();
    this.openDatabase();
    this.locator.initLocator(
      this.handleOnLocation.bind(this),
      this.handleOnLocationError.bind(this),
    );
    this.getCurrentPosition();
  }

  componentWillUnmount() {
    console.log('main componentWillUnmount');
    this.clearTimerInterval();
    this.clearPeriodInterval();
    this.closeDatabase();
    this.locator.removeLocator();
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

  setTimerInterval() {
    const interval = 29000;
    this.timerInterval = setInterval(() => {
      console.log('run with timerInterval');
      this.setState({today: moment()});
    }, interval);
  }

  clearTimerInterval() {
    clearInterval(this.timerInterval);
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
    this.setState({year}, () => {
      this.getList();
    });
  }

  setMonth(month) {
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
        Database.setRealm(realm);
        this.initPicker(realm);
        this.initTripDetector(realm);
        this.setPeriodInterval(realm);
        this.getRemainedLocationList(realm);
        this.getList();
      });
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
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
      const msg = `${error.code}: ${error.message}`;
      toast(msg);
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

  getList() {
    console.log('main getList');
    const {realm, year, month} = this.state;
    if (!realm) {
      return;
    }
    const trips =
      year && month
        ? Database.getTripListByYearMonth(realm, year, month + 1, true)
        : Database.getTripList(this.state.realm).sorted('created', true);
    // this.deleteTrips(list);
    // this.writeJsonToFile(list);
    // this.readJsonFromFile();
    const list = trips.filtered('endCreated != null');
    console.log('getList list', list.length);
    this.setState({list});
    // this.testNewLocation();
  }

  // test purpose only
  deleteTrips(list) {
    const deleteList = list.filtered('created >= $0', 1586221200000);
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
    const lastTimestamp = lastTrip.endCreated || lastTrip.startCreated || 0;
    if (lastTrip.startCreated && !lastTrip.endCreated) {
      this.newTrip(lastTrip);
    }
    const locations = Database.getLocationListByTimestamp(
      realm,
      lastTimestamp,
    ).sorted('created', false);
    // console.log('to be processing locations', locations.map(x => x.created));
    console.log('to be processing locations', locations.length);
    this.doDetectOnRemainedLocationList(realm, locations, lastTimestamp);
  }

  getLastTrip(realm) {
    const list = Database.getTripList(realm)
      .sorted('created', true)
      .slice(0, 1);
    const lastTrip = list.length === 1 ? list[0] : {};
    console.log('lastTrip', lastTrip);
    return lastTrip;
  }

  doDetectOnRemainedLocationList(realm, locations, lastTimestamp) {
    if (locations.length === 0) {
      return;
    }
    this.tripDetector.setAllowTripEndAtFirst(true);
    if (lastTimestamp === 0) {
      this.tripDetector.setPreviousLocation();
    } else {
      this.tripDetector.setPreviousLocation(locations[0]);
    }
    for (let index = 1; index < locations.length; index++) {
      const location = locations[index];
      this.tripDetector.detectAtOnce(location);
    }
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
    const previousLocation = this.tripDetector.getPreviousLocation();
    let lastPrevious = this.tripDetector.getLastPrevious();
    const totalDistance = this.tripDetector.getTotalDistance();
    console.log('previousLocation', previousLocation);
    console.log('lastPrevious', lastPrevious);
    console.log('totalDistance', totalDistance);
    const nowTimestamp = new Date().getTime();
    console.log('nowTimestamp', nowTimestamp);
    if (!lastPrevious) {
      lastPrevious = {...previousLocation};
    }
    const referTimestamp = Math.max(
      lastTrip.startCreated,
      lastPrevious.created,
    );
    const dt = nowTimestamp - referTimestamp;
    console.log('referTimestamp', referTimestamp);
    console.log('dt', dt, TimeUtil.msToTime(dt));
    const period = this.setting.period * 60 * 1000;
    if (lastPrevious.created === 0 || dt < period) {
      return;
    }
    console.log('lastTrip auto ending required');
    const item = {
      id: lastTrip.id,
      latitude: lastPrevious.latitude,
      longitude: lastPrevious.longitude,
      totalDistance: totalDistance,
      created: referTimestamp,
    };
    this.updateTripEnd(item, realm);
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
    Database.saveTrip(this.state.realm, item, this.tripType)
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
        const msg = `new: ${coords.latitude}, ${coords.longitude}`;
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
    toast(msg);
  }

  testNewLocation() {
    const location = {
      accuracy: 48,
      altitude: 68.0428826137193,
      heading: 0,
      latitude: 37.53006144198941 + 0.5,
      longitude: 126.99286469807542,
      speed: 5,
      created: 1586254156999,
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
    const lastPrevious = this.tripDetector.getLastPrevious();
    const totalDistance = this.tripDetector.getTotalDistance();
    const isLocationChanged = this.tripDetector.getIsLocationChanged();
    console.log('previousLocation', previousLocation);
    console.log('lastPrevious', lastPrevious);
    console.log('totalDistance', totalDistance);
    if (isTest || isLocationChanged) {
      previousLocation.totalDistance = totalDistance;
      const updateTrip = tripCallbackItemToTripRecord(previousLocation, true);
      this.updateTrip(updateTrip);
    }
  }

  newTrip(newTrip) {
    newTrip.tripType = this.tripType;
    console.log('newTrip', newTrip);
    this.setState({trip: newTrip});
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
      Database.saveTrip(this.state.realm, item, this.tripType)
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
      toast(msg);
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
      this.updateTripEnd(item);
    };
    const errorCallback = error => {
      const msg = `${error.code}: ${error.message}`;
      toast(msg);
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

  getParamsFromCurrentTrip(item, today) {
    console.log('getParamsFromCurrentTrip', item);
    const time = today.format('HH:mm');
    let startLabel = '출발';
    let startTime = time;
    let startDisabled = false;
    let endLabel = '도착';
    let endTime = '00:00';
    let endDisabled = true;
    let totalDistance = getKilometers(0.0);
    let tripType = item.tripType ? item.tripType : Database.Trip.Type.COMMUTE;
    if (item.startCreated) {
      endTime = time;
      startLabel = '운행중';
      startTime = TimeUtil.timeToHourMin(item.startCreated);
      startDisabled = true;
      endDisabled = false;
      totalDistance = getKilometers(item.totalDistance);
    }
    return {
      startLabel,
      startTime,
      startDisabled,
      endLabel,
      endTime,
      endDisabled,
      totalDistance,
      tripType,
    };
  }

  onTripTypeChanged(type) {
    console.log('onTripTypeChanged', type);
    this.tripType = type;
    this.updateTrip({tripType: type});
  }

  renderCurrentTrip(item, today) {
    const params = this.getParamsFromCurrentTrip(item, today);
    // console.log('renderCurrentTrip', params);
    return (
      <View>
        <View style={styles.tripDate}>
          <Text style={styles.todayDate}>
            {today.format('LL')} ({today.format('dd')})
          </Text>
        </View>
        <View style={styles.tripContainer}>
          <TripButton
            label={params.startLabel}
            time={params.startTime}
            disabled={params.startDisabled}
            onPress={this.onStartButton.bind(this)}
          />
          <TripButton
            label={params.endLabel}
            time={params.endTime}
            disabled={params.endDisabled}
            onPress={this.onEndButton.bind(this)}
          />
        </View>
        <View style={styles.tripDistance}>
          <Text style={styles.tripDistanceText}>{params.totalDistance}</Text>
        </View>
        <View style={styles.tripType}>
          <TripTypeButton
            type={params.tripType}
            onValueChanged={this.onTripTypeChanged.bind(this)}
          />
        </View>
      </View>
    );
  }

  renderItem(item) {
    const tripLabel = '도착';
    const endCreated = item.endCreated
      ? TimeUtil.timeToHourMin(item.endCreated)
      : '미확정';
    const endLatitude = item.endLatitude ? toFixed(item.endLatitude) : 0;
    const endLongitude = item.endLongitude ? toFixed(item.endLongitude) : 0;
    const totalDistance = getKilometers(item.totalDistance);
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.dateText}>
            {TimeUtil.timeToMonthDay(item.startCreated)}
          </Text>
          <Text>{TimeUtil.timeToWeek(item.startCreated)}</Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.titleText}>
            {'출발'} {TimeUtil.timeToHourMin(item.startCreated)}
          </Text>
          <Text style={styles.addressText}>
            {'    '} 좌표: {toFixed(item.startLatitude)},{' '}
            {toFixed(item.startLongitude)}
          </Text>
          <Text style={styles.titleText}>
            {tripLabel} {endCreated}
          </Text>
          <Text style={styles.addressText}>
            {'    '} 좌표: {endLatitude}, {endLongitude}
          </Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.totalDistanceText}>{totalDistance}</Text>
        </View>
      </View>
    );
  }

  render() {
    console.log('main render');
    const {today, trip, list, year, month, pickerItems} = this.state;
    // console.log('list', list.length);
    console.log('trip', trip);
    // console.log('year', year, 'month', month);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.currentTrip}>
          {this.renderCurrentTrip(trip, today)}
        </View>
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
        <FlatList
          data={list}
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={(item, index) => String(index)}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentTrip: {
    paddingVertical: 10,
    backgroundColor: '#DCDCDC',
    justifyContent: 'center',
  },
  todayDate: {
    fontSize: 20,
    fontWeight: 'normal',
    paddingHorizontal: 20,
    paddingTop: 10,
    color: color.font1,
  },
  tripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  tripDistance: {
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 10,
  },
  tripDistanceText: {
    fontSize: 18,
    // fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: color.bg1,
    borderRadius: 10,
  },
  tripDate: {
    alignItems: 'center',
    marginBottom: 10,
  },
  tripType: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
    // borderWidth: 1,
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
    // borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  totalDistanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
  },
  yearMonthPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginHorizontal: 10,
    marginVertical: 10,
  },
});
